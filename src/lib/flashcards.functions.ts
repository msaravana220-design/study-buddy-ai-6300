import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type FlashcardShape = { topic: string; question: string; answer: string };

async function extractText(
  material: {
    content: string;
    file_url: string | null;
    file_type: string | null;
    file_name: string | null;
  },
  supabase: {
    storage: {
      from: (b: string) => {
        download: (p: string) => Promise<{ data: Blob | null; error: unknown }>;
      };
    };
  },
): Promise<string> {
  if (material.content && material.content.trim().length > 0) return material.content;
  if (!material.file_url) throw new Error("This material has no content. Please re-upload or paste text.");
  if (material.file_type !== "PDF") {
    throw new Error("Automatic text extraction is only supported for PDFs. For DOCX, please paste the text when uploading.");
  }
  const { data, error } = await supabase.storage.from("study-materials").download(material.file_url);
  if (error || !data) throw new Error("Could not download file for extraction.");
  const buf = new Uint8Array(await data.arrayBuffer());
  const { extractText: unpdfExtract, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(buf);
  const { text } = await unpdfExtract(pdf, { mergePages: true });
  const merged = Array.isArray(text) ? text.join("\n\n") : text;
  if (!merged || merged.trim().length === 0) throw new Error("Could not extract any text from this PDF.");
  return merged;
}

export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { materialId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: material, error: matErr } = await supabase
      .from("study_materials")
      .select("id, title, subject, content, file_url, file_type, file_name")
      .eq("id", data.materialId)
      .maybeSingle();
    if (matErr) throw new Error(matErr.message);
    if (!material) throw new Error("Material not found.");

    const rawText = await extractText(material, supabase);
    const clipped = rawText.slice(0, 60000);

    const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing GROQ_API_KEY environment variable.");

    const isGroq = apiKey.startsWith("gsk_");
    const endpoint = isGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.x.ai/v1/chat/completions";
    const model = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

    const systemPrompt = `You are an expert study coach. Create high-quality flashcards from the source material for active recall. Respond ONLY with JSON matching the schema.`;
    const userPrompt = `Source title: ${material.title}\nSubject: ${material.subject}\n\nSOURCE MATERIAL:\n"""\n${clipped}\n"""\n\nReturn a JSON object with a single field "flashcards": an array of 8-15 items, each with:\n- topic: string (a short topic tag, 1-4 words)\n- question: string (clear, specific, one-sentence question)\n- answer: string (concise, complete answer, 1-3 sentences)`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("AI is rate-limited. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace billing.");
      throw new Error(`AI request failed [${res.status}]: ${body}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: { flashcards?: FlashcardShape[] };
    try {
      parsed = JSON.parse(content) as { flashcards?: FlashcardShape[] };
    } catch {
      throw new Error("AI returned an invalid response. Try regenerating.");
    }
    const cards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
    const normalized = cards
      .filter((c) => c && typeof c === "object" && c.question && c.answer)
      .map((c) => ({
        topic: String(c.topic ?? ""),
        question: String(c.question),
        answer: String(c.answer),
      }));

    if (normalized.length === 0) throw new Error("AI did not return any flashcards. Try regenerating.");

    // Replace existing flashcards for this material
    await supabase.from("flashcards").delete().eq("user_id", userId).eq("material_id", material.id);

    const rows = normalized.map((c, i) => ({
      user_id: userId,
      material_id: material.id,
      topic: c.topic,
      question: c.question,
      answer: c.answer,
      position: i,
    }));

    const { data: inserted, error: insErr } = await supabase
      .from("flashcards")
      .insert(rows)
      .select("id, topic, question, answer, position")
      .order("position", { ascending: true });
    if (insErr) throw new Error(insErr.message);

    return inserted ?? [];
  });
