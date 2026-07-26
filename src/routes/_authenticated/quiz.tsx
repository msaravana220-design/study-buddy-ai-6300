import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateQuiz, submitQuizAttempt, type QuizQuestion, type QuizType } from "@/lib/quiz.functions";

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — StudyAI" },
      { name: "description", content: "Test your knowledge with AI-generated quizzes." },
      { property: "og:title", content: "Quiz — StudyAI" },
      { property: "og:description", content: "Take a quiz on your study material." },
    ],
  }),
  component: QuizPage,
});

type Material = { id: string; title: string; subject: string };
type ActiveQuiz = { id: string; quiz_type: QuizType; questions: QuizQuestion[] };
type GradedAnswer = {
  question: string;
  user_answer: string;
  correct_answer: string;
  explanation: string;
  correct: boolean;
};
type Result = { id: string; score: number; total: number; answers: GradedAnswer[] };

function QuizPage() {
  const generate = useServerFn(generateQuiz);
  const submit = useServerFn(submitQuizAttempt);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState<string>("");
  const [quizType, setQuizType] = useState<QuizType>("mcq");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("study_materials")
        .select("id, title, subject")
        .order("created_at", { ascending: false });
      setMaterials(data ?? []);
    })();
  }, []);

  const progress = useMemo(() => {
    if (!quiz) return 0;
    return ((i + 1) / quiz.questions.length) * 100;
  }, [quiz, i]);

  const onGenerate = async () => {
    if (!materialId) {
      toast.error("Select a study material first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const q = await generate({ data: { materialId, quizType, numQuestions } });
      const questions = (q.questions as unknown as QuizQuestion[]) ?? [];
      setQuiz({ id: q.id, quiz_type: q.quiz_type as QuizType, questions });
      setAnswers(Array(questions.length).fill(""));
      setI(0);
      toast.success(`Generated ${questions.length} questions`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const r = await submit({ data: { quizId: quiz.id, answers } });
      setResult({
        id: r.id,
        score: r.score,
        total: r.total,
        answers: r.answers as unknown as GradedAnswer[],
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setQuiz(null);
    setAnswers([]);
    setResult(null);
    setI(0);
  };

  return (
    <AppLayout title="Quiz" subtitle="Generate quizzes from your study material.">
      <div className="mx-auto max-w-2xl space-y-6">
        {!quiz && !result && (
          <Card className="rounded-3xl border-border shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-lg">Create a quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Study material</Label>
                <Select value={materialId} onValueChange={setMaterialId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={materials.length ? "Choose a material" : "Upload a material first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title} · {m.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Question type</Label>
                  <Select value={quizType} onValueChange={(v) => setQuizType(v as QuizType)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="short_answer">Short answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of questions</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value) || 1)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button className="w-full rounded-xl" onClick={onGenerate} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate quiz
              </Button>
            </CardContent>
          </Card>
        )}

        {quiz && !result && (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {i + 1} of {quiz.questions.length}</span>
              <Badge variant="secondary" className="rounded-full capitalize">
                {quiz.quiz_type.replace("_", " ")}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />

            <Card className="rounded-3xl border-border shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold leading-relaxed">
                  {quiz.questions[i].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quiz.quiz_type === "mcq" && (
                  <div className="space-y-2">
                    {(quiz.questions[i].options ?? []).map((opt, idx) => {
                      const selected = answers[i] === opt;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const next = [...answers];
                            next[i] = opt;
                            setAnswers(next);
                          }}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                            "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
                            selected && "border-primary bg-accent",
                          )}
                        >
                          <span className="mr-3 inline-grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {quiz.quiz_type === "true_false" && (
                  <RadioGroup
                    value={answers[i]}
                    onValueChange={(v) => {
                      const next = [...answers];
                      next[i] = v;
                      setAnswers(next);
                    }}
                    className="grid gap-2"
                  >
                    {["True", "False"].map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium",
                          answers[i] === opt && "border-primary bg-accent",
                        )}
                      >
                        <RadioGroupItem value={opt} />
                        {opt}
                      </label>
                    ))}
                  </RadioGroup>
                )}

                {quiz.quiz_type === "short_answer" && (
                  <Textarea
                    placeholder="Type your answer..."
                    value={answers[i]}
                    onChange={(e) => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                    }}
                    className="min-h-24 rounded-xl"
                  />
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setI((n) => Math.max(0, n - 1))}
                    disabled={i === 0}
                  >
                    Previous
                  </Button>
                  {i < quiz.questions.length - 1 ? (
                    <Button className="rounded-xl" onClick={() => setI((n) => n + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button className="rounded-xl" onClick={onSubmit} disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {result && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-border shadow-[var(--shadow-elegant)]">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                  <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-semibold">Quiz complete!</h2>
                <p className="text-muted-foreground">
                  You scored <span className="font-semibold text-foreground">{result.score}</span> / {result.total}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button className="rounded-xl" onClick={reset}>New quiz</Button>
                </div>
              </CardContent>
            </Card>

            {result.answers.map((a, idx) => (
              <Card key={idx} className="rounded-3xl border-border shadow-[var(--shadow-soft)]">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  {a.correct ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="mt-1 h-5 w-5 text-destructive" />
                  )}
                  <CardTitle className="text-base font-semibold leading-relaxed">
                    {idx + 1}. {a.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={cn("font-medium", a.correct ? "text-success" : "text-destructive")}>
                      {a.user_answer || "—"}
                    </span>
                  </p>
                  {!a.correct && (
                    <p>
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="font-medium text-foreground">{a.correct_answer}</span>
                    </p>
                  )}
                  {a.explanation && (
                    <p className="rounded-xl bg-muted/50 p-3 text-muted-foreground">{a.explanation}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
