import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { generateFlashcards } from "@/lib/flashcards.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — StudyAI" },
      { name: "description", content: "AI-generated flashcards for active recall." },
      { property: "og:title", content: "Flashcards — StudyAI" },
      { property: "og:description", content: "Study with AI-generated flashcards." },
    ],
  }),
  component: FlashcardsPage,
});

type Material = { id: string; title: string; subject: string };
type Flashcard = { id: string; topic: string; question: string; answer: string; position: number };

function FlashcardsPage() {
  const generate = useServerFn(generateFlashcards);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("study_materials")
        .select("id, title, subject")
        .order("created_at", { ascending: false });
      setMaterials(data ?? []);
      if (data && data.length > 0 && !selected) setSelected(data[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) { setCards([]); return; }
    setLoading(true);
    setI(0);
    setFlipped(false);
    supabase
      .from("flashcards")
      .select("id, topic, question, answer, position")
      .eq("material_id", selected)
      .order("position", { ascending: true })
      .then(({ data }) => {
        setCards((data ?? []) as Flashcard[]);
        setLoading(false);
      });
  }, [selected]);

  const material = useMemo(() => materials.find((m) => m.id === selected), [materials, selected]);
  const card = cards[i];

  const next = () => { if (!cards.length) return; setFlipped(false); setI((i + 1) % cards.length); };
  const prev = () => { if (!cards.length) return; setFlipped(false); setI((i - 1 + cards.length) % cards.length); };

  const onGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const result = await generate({ data: { materialId: selected } });
      setCards(result as Flashcard[]);
      setI(0);
      setFlipped(false);
      toast.success(`Generated ${result.length} flashcards`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout title="Flashcards" subtitle="Generate and review flashcards from your materials.">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="rounded-3xl border-border shadow-[var(--shadow-soft)]">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Study material</label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={materials.length ? "Select a material" : "No materials uploaded yet"} />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title} — {m.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="rounded-xl md:mt-5" onClick={onGenerate} disabled={!selected || generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {cards.length ? "Regenerate" : "Generate Flashcards"}
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : cards.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-border">
            <CardContent className="p-10 text-center text-muted-foreground">
              {material
                ? "No flashcards yet. Click Generate Flashcards to create them."
                : "Upload a study material first to generate flashcards."}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Card {i + 1} of {cards.length}</span>
              {card?.topic ? <Badge variant="secondary" className="rounded-full">{card.topic}</Badge> : null}
            </div>

            <button onClick={() => setFlipped((f) => !f)} className="w-full" aria-label="Flip card">
              <Card
                className="min-h-72 cursor-pointer rounded-3xl border-border shadow-[var(--shadow-elegant)] transition-transform hover:-translate-y-0.5"
                style={{ background: flipped ? "var(--card)" : "var(--gradient-soft)" }}
              >
                <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {flipped ? "Answer" : "Question"}
                  </p>
                  <p className="text-xl font-semibold leading-relaxed md:text-2xl">
                    {flipped ? card.answer : card.question}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">Tap card to flip</p>
                </CardContent>
              </Card>
            </button>

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" className="rounded-xl" onClick={prev}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setFlipped(false)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={next}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
