import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/summary")({
  head: () => ({
    meta: [
      { title: "AI Summary — StudyAI" },
      { name: "description", content: "Concise AI-generated summaries of your uploaded study material." },
      { property: "og:title", content: "AI Summary — StudyAI" },
      { property: "og:description", content: "AI summaries of your notes." },
    ],
  }),
  component: SummaryPage,
});

const keyPoints = [
  "Cells are the fundamental structural and functional units of all living organisms.",
  "Prokaryotic cells lack a membrane-bound nucleus; eukaryotic cells contain organelles enclosed by membranes.",
  "The plasma membrane regulates the movement of substances via passive and active transport.",
  "Mitochondria generate ATP through cellular respiration; chloroplasts perform photosynthesis in plant cells.",
  "The cell cycle consists of interphase (G1, S, G2) and the mitotic phase, tightly regulated by checkpoints.",
];

function SummaryPage() {
  return (
    <AppLayout title="AI Summary" subtitle="Generated from Cell Biology - Chapter 4.pdf">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                  <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <CardTitle className="text-base font-semibold">Overview</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-xl"><Copy className="mr-1.5 h-4 w-4" />Copy</Button>
                <Button variant="ghost" size="sm" className="rounded-xl"><Download className="mr-1.5 h-4 w-4" />Export</Button>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                This chapter introduces the cell as the fundamental unit of life, contrasting prokaryotic and
                eukaryotic organization and covering major organelles, membrane transport, and the cell cycle.
                Emphasis is placed on how structure supports function, from membrane compartmentalization to
                energy conversion in mitochondria and chloroplasts.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Key points</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{p}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Topics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Cell theory", "Organelles", "Membrane transport", "Mitochondria", "Cell cycle", "Mitosis"].map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Suggested next steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="rounded-xl bg-accent/60 p-3">Practice 12 auto-generated flashcards on organelles.</p>
              <p className="rounded-xl bg-accent/60 p-3">Take a 10-question quiz on membrane transport.</p>
              <p className="rounded-xl bg-accent/60 p-3">Schedule a 45-min review session for Friday.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
