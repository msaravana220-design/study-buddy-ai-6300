import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image as ImageIcon, FileType, Trash2 } from "lucide-react";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Study Material — StudyAI" },
      { name: "description", content: "Upload PDFs, notes and slides. StudyAI will process them into summaries and quizzes." },
      { property: "og:title", content: "Upload Study Material — StudyAI" },
      { property: "og:description", content: "Upload notes to StudyAI." },
    ],
  }),
  component: UploadPage,
});

const recent = [
  { name: "Cell Biology - Chapter 4.pdf", size: "2.4 MB", type: "PDF", when: "2h ago", status: "Processed" },
  { name: "Calculus Notes - Week 6.docx", size: "812 KB", type: "DOC", when: "Yesterday", status: "Processed" },
  { name: "History Slides.pptx", size: "5.1 MB", type: "PPT", when: "3 days ago", status: "Processing" },
  { name: "Chem Diagram.png", size: "340 KB", type: "IMG", when: "1 week ago", status: "Processed" },
];

const iconFor = (t: string) => (t === "IMG" ? ImageIcon : t === "PDF" ? FileText : FileType);

function UploadPage() {
  return (
    <AppLayout title="Upload study material" subtitle="Drop PDFs, notes, slides or images. We'll do the rest.">
      <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
        <CardContent className="p-6">
          <label
            htmlFor="file"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-14 text-center transition hover:border-primary/50 hover:bg-accent/30"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
              <Upload className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground">or click to browse — PDF, DOCX, PPTX, PNG, JPG · up to 50MB</p>
            </div>
            <Button type="button" className="mt-2 rounded-xl">Choose files</Button>
            <input id="file" type="file" className="hidden" multiple />
          </label>
        </CardContent>
      </Card>

      <Card className="mt-4 rounded-2xl border-border shadow-[var(--shadow-soft)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent uploads</CardTitle>
          <Badge variant="secondary" className="rounded-full">{recent.length} files</Badge>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {recent.map((f) => {
            const Icon = iconFor(f.type);
            return (
              <div key={f.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.size} · {f.when}</p>
                </div>
                <Badge
                  variant={f.status === "Processed" ? "secondary" : "outline"}
                  className="hidden rounded-full sm:inline-flex"
                >
                  {f.status}
                </Badge>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
