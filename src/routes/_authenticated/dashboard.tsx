import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Sparkles,
  Layers,
  ListChecks,
  CalendarDays,
  Upload,
  ArrowRight,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyAI" },
      { name: "description", content: "Your StudyAI workspace: materials, summaries, flashcards, quizzes and study plans." },
      { property: "og:title", content: "Dashboard — StudyAI" },
      { property: "og:description", content: "Your StudyAI workspace at a glance." },
    ],
  }),
  component: Dashboard,
});

const overview = [
  { label: "Materials", value: 12, icon: FileText, to: "/upload" as const, tint: "from-blue-500/15 to-blue-500/5" },
  { label: "Summaries", value: 8, icon: Sparkles, to: "/summary" as const, tint: "from-violet-500/15 to-violet-500/5" },
  { label: "Flashcard sets", value: 5, icon: Layers, to: "/flashcards" as const, tint: "from-indigo-500/15 to-indigo-500/5" },
  { label: "Quizzes taken", value: 9, icon: ListChecks, to: "/quiz" as const, tint: "from-fuchsia-500/15 to-fuchsia-500/5" },
];

const quickActions = [
  { to: "/upload" as const, label: "Upload material", desc: "PDF, DOCX or notes", icon: Upload },
  { to: "/summary" as const, label: "Generate summary", desc: "Key points in seconds", icon: Sparkles },
  { to: "/flashcards" as const, label: "Create flashcards", desc: "Auto-built from notes", icon: Layers },
  { to: "/quiz" as const, label: "Start a quiz", desc: "Test your knowledge", icon: ListChecks },
];

const latestMaterials = [
  { title: "Biology — Chapter 4 Notes.pdf", meta: "12 pages · Today" },
  { title: "Calculus II Lecture 7.docx", meta: "8 pages · Yesterday" },
  { title: "WWII Overview.pdf", meta: "20 pages · 3d ago" },
];

const latestSummaries = [
  { title: "Cell division key points", meta: "Biology · 5 min read" },
  { title: "Integration techniques", meta: "Calculus II · 7 min read" },
];

const recentQuizzes = [
  { title: "Biology Ch. 4 quiz", meta: "8 / 10" },
  { title: "Derivatives practice", meta: "12 / 15" },
  { title: "WWII timeline", meta: "7 / 10" },
];

const activePlan = {
  title: "Biology midterm plan",
  meta: "2 weeks · 6 sessions",
  next: "Next: Cell cycle review — Thu 5:00 PM",
};

function Dashboard() {
  return (
    <AppLayout title="Welcome back 👋" subtitle="Pick up where you left off or start something new.">
      {/* Hero */}
      <section
        className="mb-6 overflow-hidden rounded-3xl p-6 md:p-8 text-primary-foreground shadow-[var(--shadow-elegant)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Your workspace</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Turn your notes into summaries, flashcards & quizzes.
            </h2>
            <p className="mt-2 text-sm opacity-90">
              Upload a document and let StudyAI do the heavy lifting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link to="/upload"><Upload className="mr-2 h-4 w-4" /> Upload material</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link to="/summary"><Sparkles className="mr-2 h-4 w-4" /> New summary</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Overview stats */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {overview.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${s.tint} p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-background/70 backdrop-blur">
                <s.icon className="h-4.5 w-4.5 text-primary" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </section>

      {/* Quick actions */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Quick actions</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <a.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.label}</p>
                <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Content grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)] lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Uploaded materials
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/upload">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestMaterials.map((it) => (
              <Row key={it.title} title={it.title} meta={it.meta} />
            ))}
          </CardContent>
        </Card>

        <Card
          className="rounded-2xl border-none shadow-[var(--shadow-soft)] text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarDays className="h-4 w-4" /> Active study plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-semibold leading-tight">{activePlan.title}</p>
              <p className="mt-0.5 text-xs opacity-80">{activePlan.meta}</p>
            </div>
            <p className="rounded-xl bg-white/15 p-3 text-xs backdrop-blur">{activePlan.next}</p>
            <Button asChild variant="secondary" size="sm" className="w-full rounded-full">
              <Link to="/study-plan">Open plan</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Recent summaries
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/summary">Open</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestSummaries.map((it) => (
              <Row key={it.title} title={it.title} meta={it.meta} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Layers className="h-4 w-4 text-primary" /> Flashcard sets
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/flashcards">Open</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row title="Mitosis vs Meiosis" meta="24 cards" />
            <Row title="Derivatives essentials" meta="36 cards" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ListChecks className="h-4 w-4 text-primary" /> Quiz results
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/quiz">New quiz</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentQuizzes.map((it) => (
              <div
                key={it.title}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
              >
                <p className="truncate text-sm font-medium">{it.title}</p>
                <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  {it.meta}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}

function Row({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
    </div>
  );
}
