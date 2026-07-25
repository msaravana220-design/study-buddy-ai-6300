import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, FileText, FileType } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateSummary } from "@/lib/summary.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/summary")({
  head: () => ({
    meta: [
      { title: "AI Summary — StudyAI" },
      { name: "description", content: "Generate structured AI summaries from your uploaded study materials." },
      { property: "og:title", content: "AI Summary — StudyAI" },
      { property: "og:description", content: "AI summaries of your notes." },
    ],
  }),
  component: SummaryPage,
});

type Material = {
  id: string;
  title: string;
  subject: string;
  file_type: string | null;
  file_name: string | null;
  created_at: string;
};

type Summary = {
  id: string;
  material_id: string;
  overview: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  revision_notes: string[];
  updated_at: string;
};

function SummaryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const generate = useServerFn(generateSummary);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        supabase
          .from("study_materials")
          .select("id, title, subject, file_type, file_name, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("summaries")
          .select("id, material_id, overview, key_concepts, definitions, revision_notes, updated_at"),
      ]);
      if (mRes.error) toast.error(mRes.error.message);
      if (sRes.error) toast.error(sRes.error.message);
      const mats = (mRes.data ?? []) as Material[];
      setMaterials(mats);
      const map: Record<string, Summary> = {};
      for (const s of (sRes.data ?? []) as Summary[]) {
        map[s.material_id] = s;
      }
      setSummaries(map);
      if (mats.length > 0) setSelectedId((prev) => prev ?? mats[0].id);
      setLoading(false);
    })();
  }, []);

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id === selectedId) ?? null,
    [materials, selectedId],
  );
  const selectedSummary = selectedId ? summaries[selectedId] : undefined;

  async function handleGenerate() {
    if (!selectedId) return;
    setGenerating(true);
    try {
      const result = await generate({ data: { materialId: selectedId } });
      setSummaries((prev) => ({
        ...prev,
        [selectedId]: {
          id: result.id,
          material_id: selectedId,
          overview: result.overview,
          key_concepts: result.key_concepts,
          definitions: result.definitions,
          revision_notes: result.revision_notes,
          updated_at: new Date().toISOString(),
        },
      }));
      toast.success("Summary ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate summary";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppLayout title="AI Summary" subtitle="Generate structured summaries from your uploaded materials.">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Material picker */}
        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)] lg:sticky lg:top-24 lg:self-start">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Your materials</CardTitle>
            <Badge variant="secondary" className="rounded-full">{materials.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading...
              </div>
            ) : materials.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Upload a material first to generate a summary.
              </p>
            ) : (
              materials.map((m) => {
                const Icon = m.file_type === "PDF" ? FileText : FileType;
                const active = selectedId === m.id;
                const hasSummary = Boolean(summaries[m.id]);
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "hover:bg-accent/60",
                    )}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.subject}</p>
                    </div>
                    {hasSummary && (
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Summary panel */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {selectedMaterial ? selectedMaterial.title : "Select a material"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedMaterial
                      ? `${selectedMaterial.subject}${selectedSummary ? " · Summary saved" : ""}`
                      : "Then click Generate Summary"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!selectedId || generating}
                className="rounded-xl"
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : selectedSummary ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {selectedSummary ? "Regenerate" : "Generate Summary"}
              </Button>
            </CardContent>
          </Card>

          {generating && !selectedSummary && (
            <Card className="rounded-2xl border-dashed border-border">
              <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Reading your material and drafting a summary…
              </CardContent>
            </Card>
          )}

          {!generating && !selectedSummary && selectedMaterial && (
            <Card className="rounded-2xl border-dashed border-border">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No summary yet. Click <span className="font-medium text-foreground">Generate Summary</span> to create one.
              </CardContent>
            </Card>
          )}

          {selectedSummary && (
            <>
              <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Overview</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {selectedSummary.overview || "—"}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Key concepts</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSummary.key_concepts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {selectedSummary.key_concepts.map((k, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                            {i + 1}
                          </span>
                          <p className="text-sm leading-relaxed">{k}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Important definitions</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSummary.definitions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {selectedSummary.definitions.map((d, i) => (
                        <div key={i} className="rounded-xl bg-accent/50 p-3">
                          <dt className="text-sm font-semibold">{d.term}</dt>
                          <dd className="mt-1 text-sm text-muted-foreground">{d.definition}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Revision notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSummary.revision_notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedSummary.revision_notes.map((n, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
