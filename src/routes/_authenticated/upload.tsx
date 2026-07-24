import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, FileType, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Upload Study Material — StudyAI" },
      { name: "description", content: "Upload PDF or DOCX files, or paste notes. StudyAI saves them to your workspace." },
      { property: "og:title", content: "Upload Study Material — StudyAI" },
      { property: "og:description", content: "Upload notes to StudyAI." },
    ],
  }),
  component: UploadPage,
});

type Material = {
  id: string;
  title: string;
  subject: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
};

const ACCEPTED = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function UploadPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");

  async function loadMaterials() {
    setLoading(true);
    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setMaterials(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  function reset() {
    setTitle("");
    setSubject("");
    setFile(null);
    setText("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      toast.error("Add a title and subject.");
      return;
    }
    if (mode === "file" && !file) {
      toast.error("Choose a PDF or DOCX file.");
      return;
    }
    if (mode === "text" && !text.trim()) {
      toast.error("Paste some content.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw userErr ?? new Error("Not signed in");
      const userId = userData.user.id;

      let file_url: string | null = null;
      let file_name: string | null = null;
      let file_type: string | null = null;
      let content = text;

      if (mode === "file" && file) {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isDocx =
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.toLowerCase().endsWith(".docx");
        if (!isPdf && !isDocx) {
          throw new Error("Only PDF and DOCX files are supported.");
        }
        const path = `${userId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("study-materials")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        file_url = path;
        file_name = file.name;
        file_type = isPdf ? "PDF" : "DOCX";
        content = "";
      }

      const { error: insErr } = await supabase.from("study_materials").insert({
        user_id: userId,
        title: title.trim(),
        subject: subject.trim(),
        content,
        file_url,
        file_name,
        file_type,
      });
      if (insErr) throw insErr;

      toast.success("Material saved.");
      reset();
      loadMaterials();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(m: Material) {
    if (!confirm(`Delete "${m.title}"?`)) return;
    if (m.file_url) {
      await supabase.storage.from("study-materials").remove([m.file_url]);
    }
    const { error } = await supabase.from("study_materials").delete().eq("id", m.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    setMaterials((prev) => prev.filter((x) => x.id !== m.id));
  }

  return (
    <AppLayout title="Upload study material" subtitle="Add a PDF, DOCX or paste text — StudyAI keeps it in your library.">
      <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Cell Biology Chapter 4" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "file" | "text")}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="file" className="rounded-lg">Upload file</TabsTrigger>
                <TabsTrigger value="text" className="rounded-lg">Paste text</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-4">
                <label
                  htmlFor="file"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition hover:border-primary/50 hover:bg-accent/30"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                    <Upload className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{file ? file.name : "Click to choose a file"}</p>
                    <p className="text-xs text-muted-foreground">PDF or DOCX · up to 20MB</p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    accept={ACCEPTED}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Paste your notes or study content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[180px] rounded-2xl"
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="rounded-xl">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Save material
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4 rounded-2xl border-border shadow-[var(--shadow-soft)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Your materials</CardTitle>
          <Badge variant="secondary" className="rounded-full">{materials.length}</Badge>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading...
            </div>
          ) : materials.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No materials yet. Upload a file or paste some notes to get started.
            </div>
          ) : (
            materials.map((m) => {
              const Icon = m.file_type === "PDF" ? FileText : FileType;
              const date = new Date(m.created_at).toLocaleDateString(undefined, {
                month: "short", day: "numeric", year: "numeric",
              });
              return (
                <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.subject} · {m.file_name ?? "Pasted text"} · {date}
                    </p>
                  </div>
                  <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
                    {m.file_type ?? "TEXT"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(m)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
