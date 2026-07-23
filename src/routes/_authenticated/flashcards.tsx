import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — StudyAI" },
      { name: "description", content: "AI-generated flashcards for active recall and spaced repetition." },
      { property: "og:title", content: "Flashcards — StudyAI" },
      { property: "og:description", content: "Study with AI-generated flashcards." },
    ],
  }),
  component: FlashcardsPage,
});

const cards = [
  { q: "What is the powerhouse of the cell?", a: "The mitochondrion — it produces ATP via cellular respiration." },
  { q: "Define osmosis.", a: "Movement of water across a semipermeable membrane from low to high solute concentration." },
  { q: "What separates prokaryotes from eukaryotes?", a: "Eukaryotes have a membrane-bound nucleus and organelles; prokaryotes do not." },
  { q: "Name the phases of the cell cycle.", a: "Interphase (G1, S, G2) and the mitotic phase (M)." },
  { q: "Function of the Golgi apparatus?", a: "Modifies, sorts, and packages proteins for secretion or delivery." },
];

function FlashcardsPage() {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[i];

  const next = () => { setFlipped(false); setI((i + 1) % cards.length); };
  const prev = () => { setFlipped(false); setI((i - 1 + cards.length) % cards.length); };

  return (
    <AppLayout title="Flashcards" subtitle="Cell Biology · 5 cards">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Card {i + 1} of {cards.length}</span>
          <Badge variant="secondary" className="rounded-full">Active recall</Badge>
        </div>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="w-full"
          aria-label="Flip card"
        >
          <Card
            className="min-h-72 cursor-pointer rounded-3xl border-border shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
            style={{ background: flipped ? "var(--card)" : "var(--gradient-soft)" }}
          >
            <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {flipped ? "Answer" : "Question"}
              </p>
              <p className="text-xl font-semibold leading-relaxed md:text-2xl">
                {flipped ? card.a : card.q}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">Tap card to flip</p>
            </CardContent>
          </Card>
        </button>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="outline" className="rounded-xl" onClick={prev}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl text-destructive hover:text-destructive">
              <X className="h-4 w-4" /> Again
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setFlipped(false)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button className="rounded-xl">
              <Check className="h-4 w-4" /> Got it
            </Button>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={next}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[{ l: "Learned", v: 3 }, { l: "Review", v: 1 }, { l: "New", v: 1 }].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className="text-xs text-muted-foreground">{s.l}</p>
              <p className="mt-1 text-xl font-semibold">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
