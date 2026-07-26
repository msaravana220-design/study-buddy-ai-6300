import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type QuizType = "mcq" | "true_false" | "short_answer";

export type QuizQuestion = {
  question: string;
  options?: string[]; // mcq only
  answer: string; // canonical correct answer text (option text, "True"/"False", or short answer)
  explanation: string;
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

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { materialId: string; quizType: QuizType; numQuestions: number }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const num = Math.min(Math.max(Math.floor(data.numQuestions), 1), 20);

    const { data: material, error: matErr } = await supabase
      .from("study_materials")
      .select("id, title, subject, content, file_url, file_type, file_name")
      .eq("id", data.materialId)
      .maybeSingle();
    if (matErr) throw new Error(matErr.message);
    if (!material) throw new Error("Material not found.");

    const rawText = await extractText(material, supabase);
    const clipped = rawText.slice(0, 60000);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY.");

    const typeInstructions: Record<QuizType, string> = {
      mcq: `Each question must include:\n- question: string\n- options: string[] of exactly 4 plausible options\n- answer: string that EXACTLY matches one of the options\n- explanation: 1-2 sentence explanation of why the answer is correct`,
      true_false: `Each question must include:\n- question: a statement to evaluate\n- answer: exactly "True" or "False"\n- explanation: 1-2 sentence explanation`,
      short_answer: `Each question must include:\n- question: a specific short-answer question\n- answer: concise ideal answer (1-2 sentences or a short phrase)\n- explanation: 1-2 sentence justification with reference to the material`,
    };

    const systemPrompt = `You are an expert exam writer. Generate high-quality quiz questions strictly grounded in the source material. Respond ONLY with JSON.`;
    const userPrompt = `Source title: ${material.title}\nSubject: ${material.subject}\nQuiz type: ${data.quizType}\nNumber of questions: ${num}\n\nSOURCE MATERIAL:\n"""\n${clipped}\n"""\n\nReturn JSON: { "questions": [ ... ${num} items ... ] }.\n${typeInstructions[data.quizType]}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
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

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: { questions?: QuizQuestion[] };
    try {
      parsed = JSON.parse(content) as { questions?: QuizQuestion[] };
    } catch {
      throw new Error("AI returned an invalid response. Try regenerating.");
    }
    const raw = Array.isArray(parsed.questions) ? parsed.questions : [];
    const normalized: QuizQuestion[] = raw
      .filter((q) => q && typeof q === "object" && q.question && q.answer)
      .map((q) => {
        const base: QuizQuestion = {
          question: String(q.question),
          answer: String(q.answer),
          explanation: String(q.explanation ?? ""),
        };
        if (data.quizType === "mcq") {
          const opts = Array.isArray(q.options) ? q.options.map(String) : [];
          base.options = opts;
        }
        return base;
      })
      .filter((q) => (data.quizType === "mcq" ? Array.isArray(q.options) && q.options.length >= 2 : true));

    if (normalized.length === 0) throw new Error("AI did not return any questions. Try regenerating.");

    const { data: inserted, error: insErr } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        material_id: material.id,
        quiz_type: data.quizType,
        num_questions: normalized.length,
        questions: normalized,
      })
      .select("id, quiz_type, num_questions, questions, material_id")
      .single();
    if (insErr) throw new Error(insErr.message);

    return inserted;
  });

export const submitQuizAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { quizId: string; answers: string[] }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: quiz, error: qErr } = await supabase
      .from("quizzes")
      .select("id, material_id, quiz_type, questions")
      .eq("id", data.quizId)
      .maybeSingle();
    if (qErr) throw new Error(qErr.message);
    if (!quiz) throw new Error("Quiz not found.");

    const questions = (quiz.questions as unknown as QuizQuestion[]) ?? [];
    const quizType = quiz.quiz_type as QuizType;

    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

    const graded = questions.map((q, i) => {
      const user = String(data.answers[i] ?? "");
      let correct = false;
      if (quizType === "short_answer") {
        // token overlap heuristic
        const answerTokens = new Set(norm(q.answer).split(/\W+/).filter((t) => t.length > 3));
        const userTokens = new Set(norm(user).split(/\W+/).filter((t) => t.length > 3));
        let overlap = 0;
        answerTokens.forEach((t) => userTokens.has(t) && overlap++);
        correct = answerTokens.size > 0 && overlap / answerTokens.size >= 0.5;
      } else {
        correct = norm(user) === norm(q.answer);
      }
      return {
        question: q.question,
        user_answer: user,
        correct_answer: q.answer,
        explanation: q.explanation,
        correct,
      };
    });

    const score = graded.filter((g) => g.correct).length;
    const total = graded.length;

    const { data: attempt, error: aErr } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: userId,
        quiz_id: quiz.id,
        material_id: quiz.material_id,
        score,
        total,
        answers: graded,
      })
      .select("id, score, total, answers")
      .single();
    if (aErr) throw new Error(aErr.message);

    return attempt;
  });
