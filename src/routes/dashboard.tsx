import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Layers, ListChecks, CalendarDays, Upload } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyAI" },
      { name: "description", content: "Your uploaded materials, AI summaries, flashcards, quizzes, and study plans." },
      { property: "og:title", content: "Dashboard — StudyAI" },
      { property: "og:description", content: "Your StudyAI workspace." },
    ],
  }),
  component: Dashboard,
});

const materials = [
  { title: "Biology — Chapter 4 Notes.pdf", meta: "12 pages · Uploaded today" },
  { title: "Calculus II Lecture 7.docx", meta: "8 pages · Yesterday" },
  { title: "WWII Overview.pdf", meta: "20 pages · 3 days ago" },
];

const summaries = [
  { title: "Cell division key points", meta: "Biology · 5 min read" },
  { title: "Integration techniques", meta: "Calculus II · 7 min read" },
  { title: "Causes of WWII", meta: "History · 6 min read" },
];

const flashcardSets = [
  { title: "Mitosis vs Meiosis", meta: "24 cards" },
  { title: "Derivatives essentials", meta: "36 cards" },
  { title: "WWII dates & figures", meta: "18 cards" },
];

const quizResults = [
  { title: "Biology Ch. 4 quiz", meta: "Score 8 / 10" },
  { title: "Derivatives practice", meta: "Score 12 / 15" },
  { title: "WWII timeline", meta: "Score 7 / 10" },
];

const studyPlans = [
  { title: "Biology midterm plan", meta: "2 weeks · 6 sessions" },
  { title: "Calculus II review", meta: "10 days · 5 sessions" },
];

function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Your study materials, summaries, flashcards, quizzes and plans.">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={FileText}
          title="Uploaded materials"
          action={{ to: "/upload", label: "Upload" }}
          items={materials}
          emptyIcon={Upload}
        />
        <SectionCard
          icon={Sparkles}
          title="Recent AI summaries"
          action={{ to: "/summary", label: "View all" }}
          items={summaries}
        />
        <SectionCard
          icon={Layers}
          title="Flashcard sets"
          action={{ to: "/flashcards", label: "Open" }}
          items={flashcardSets}
        />
        <SectionCard
          icon={ListChecks}
          title="Quiz results"
          action={{ to: "/quiz", label: "New quiz" }}
          items={quizResults}
        />
        <SectionCard
          icon={CalendarDays}
          title="Study plans"
          action={{ to: "/study-plan", label: "View plans" }}
          items={studyPlans}
          className="lg:col-span-2"
        />
      </div>
    </AppLayout>
  );
}

type Action = { to: "/upload" | "/summary" | "/flashcards" | "/quiz" | "/study-plan"; label: string };

function SectionCard({
  icon: Icon,
  title,
  action,
  items,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action: Action;
  items: { title: string; meta: string }[];
  emptyIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Card className={`rounded-2xl border-border shadow-[var(--shadow-soft)] ${className ?? ""}`}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--gradient-soft)" }}>
            <Icon className="h-4 w-4 text-primary" />
          </span>
          {title}
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it) => (
          <div
            key={it.title}
            className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{it.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{it.meta}</p>
            </div>
            <Badge variant="outline" className="shrink-0 rounded-full">Open</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
