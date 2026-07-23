import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

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

const questions = [
  {
    q: "Which organelle is responsible for producing ATP?",
    options: ["Nucleus", "Mitochondrion", "Golgi apparatus", "Ribosome"],
    answer: 1,
  },
  {
    q: "Osmosis is the movement of ___ across a semipermeable membrane.",
    options: ["Proteins", "Ions", "Water", "Glucose"],
    answer: 2,
  },
  {
    q: "Which of the following is NOT a phase of interphase?",
    options: ["G1", "S", "G2", "M"],
    answer: 3,
  },
];

function QuizPage() {
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const q = questions[i];

  const submit = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setRevealed(false);
    setSelected(null);
    setI((n) => Math.min(n + 1, questions.length - 1));
  };

  const done = revealed && i === questions.length - 1;

  return (
    <AppLayout title="Quiz" subtitle="Cell Biology · quick check">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {i + 1} of {questions.length}</span>
          <Badge variant="secondary" className="rounded-full">Score {score}/{questions.length}</Badge>
        </div>
        <Progress value={((i + (revealed ? 1 : 0)) / questions.length) * 100} className="mb-6 h-2 rounded-full" />

        {done ? (
          <Card className="rounded-3xl border-border shadow-[var(--shadow-elegant)]">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-semibold">Quiz complete!</h2>
              <p className="text-muted-foreground">You scored {score} / {questions.length}</p>
              <Button className="mt-3 rounded-xl" onClick={() => { setI(0); setScore(0); setRevealed(false); setSelected(null); }}>
                Retake quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-3xl border-border shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold leading-relaxed">{q.q}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = revealed && idx === q.answer;
                const isWrong = revealed && isSelected && idx !== q.answer;
                return (
                  <button
                    key={opt}
                    onClick={() => !revealed && setSelected(idx)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                      "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
                      isSelected && !revealed && "border-primary bg-accent",
                      isCorrect && "border-success bg-success/10 text-foreground",
                      isWrong && "border-destructive bg-destructive/10 text-foreground",
                    )}
                  >
                    <span className="mr-3 inline-grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}

              <div className="flex justify-end pt-2">
                {revealed ? (
                  <Button className="rounded-xl" onClick={next}>Next question</Button>
                ) : (
                  <Button className="rounded-xl" onClick={submit} disabled={selected === null}>
                    Submit answer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
