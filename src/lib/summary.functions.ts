import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SummaryShape = {
  overview: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  revision_notes: string[];
};

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
  if (material.content && material.content.trim().length > 0) {
    return material.content;
  }
  if (!material.file_url) {
    throw new Error("This material has no content. Please re-upload or paste text.");
  }
  if (material.file_type !== "PDF") {
    throw new Error(
      "Automatic text extraction is only supported for PDFs. For DOCX, please paste the text when uploading.",
    );
  }
  const { data, error } = await supabase.storage
    .from("study-materials")
    .download(material.file_url);
  if (error || !data) throw new Error("Could not download file for extraction.");
  const buf = new Uint8Array(await data.arrayBuffer());
  const { extractText: unpdfExtract, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(buf);
  const { text } = await unpdfExtract(pdf, { mergePages: true });
  const merged = Array.isArray(text) ? text.join("\n\n") : text;
  if (!merged || merged.trim().length === 0) {
    throw new Error("Could not extract any text from this PDF.");
  }
  return merged;
}

export const generateSummary = createServerFn({ method: "POST" })
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
    // Guard token size
    const clipped = rawText.slice(0, 60000);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY.");

    const systemPrompt = `You are an expert study coach. Produce a rigorous, well-structured study summary from the provided source material. Respond ONLY with JSON matching the given schema. Be concise but comprehensive.`;
    const userPrompt = `Source title: ${material.title}\nSubject: ${material.subject}\n\nSOURCE MATERIAL:\n"""\n${clipped}\n"""\n\nReturn a JSON object with fields:\n- overview: string (3-6 sentence high-level summary)\n- key_concepts: string[] (5-10 concise bullet points)\n- definitions: { term: string, definition: string }[] (5-10 important terms)\n- revision_notes: string[] (5-10 short actionable revision notes)`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: SummaryShape;
    try {
      parsed = JSON.parse(content) as SummaryShape;
    } catch {
      throw new Error("AI returned an invalid response. Try regenerating.");
    }

    const normalized: SummaryShape = {
      overview: String(parsed.overview ?? ""),
      key_concepts: Array.isArray(parsed.key_concepts) ? parsed.key_concepts.map(String) : [],
      definitions: Array.isArray(parsed.definitions)
        ? parsed.definitions
            .filter((d) => d && typeof d === "object")
            .map((d) => ({ term: String(d.term ?? ""), definition: String(d.definition ?? "") }))
        : [],
      revision_notes: Array.isArray(parsed.revision_notes) ? parsed.revision_notes.map(String) : [],
    };

    // Upsert: keep one summary per material per user (latest)
    const { data: existing } = await supabase
      .from("summaries")
      .select("id")
      .eq("user_id", userId)
      .eq("material_id", material.id)
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase
        .from("summaries")
        .update({
          overview: normalized.overview,
          key_concepts: normalized.key_concepts,
          definitions: normalized.definitions,
          revision_notes: normalized.revision_notes,
        })
        .eq("id", existing.id);
      if (upErr) throw new Error(upErr.message);
      return { id: existing.id, ...normalized };
    }

    const { data: inserted, error: insErr } = await supabase
      .from("summaries")
      .insert({
        user_id: userId,
        material_id: material.id,
        overview: normalized.overview,
        key_concepts: normalized.key_concepts,
        definitions: normalized.definitions,
        revision_notes: normalized.revision_notes,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    return { id: inserted.id, ...normalized };
  });
