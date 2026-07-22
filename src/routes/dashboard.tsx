import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Flame, Target, Upload, Sparkles, Layers, ListChecks } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyAI" },
      { name: "description", content: "Your study overview: streaks, hours, upcoming plans and progress." },
      { property: "og:title", content: "Dashboard — StudyAI" },
      { property: "og:description", content: "Overview of your studying." },
    ],
  }),
  component: Dashboard,
});

const chartData = [
  { day: "Mon", hours: 1.2 },
  { day: "Tue", hours: 2.4 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 3.1 },
  { day: "Fri", hours: 2.2 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 2.7 },
];

const subjects = [
  { name: "Biology", progress: 78, color: "bg-primary" },
  { name: "Calculus II", progress: 54, color: "bg-primary-glow" },
  { name: "World History", progress: 32, color: "bg-chart-4" },
  { name: "Chemistry", progress: 91, color: "bg-chart-3" },
];

const upcoming = [
  { title: "Cell Biology quiz", when: "Today · 4:00 PM", tag: "Quiz" },
  { title: "Derivatives flashcards", when: "Tomorrow · 9:00 AM", tag: "Flashcards" },
  { title: "WWII summary review", when: "Wed · 6:00 PM", tag: "Summary" },
];

const quick = [
  { to: "/upload", label: "Upload notes", icon: Upload },
  { to: "/summary", label: "AI Summary", icon: Sparkles },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/quiz", label: "Take a quiz", icon: ListChecks },
] as const;

function Dashboard() {
  return (
    <AppLayout title="Welcome back, Alex" subtitle="Here's what's on your study plan today.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Flame} label="Day streak" value="12" hint="Keep it going!" />
        <StatCard icon={Clock} label="This week" value="17.4h" hint="+2.3h vs last week" />
        <StatCard icon={BookOpen} label="Active subjects" value="4" hint="2 due this week" />
        <StatCard icon={Target} label="Weekly goal" value="82%" hint="14 / 17 hrs" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Study hours this week</CardTitle>
            <Badge variant="secondary" className="rounded-full">+18%</Badge>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quick.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground group-hover:text-primary">
                  <q.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{q.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Subject progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {subjects.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.progress}%</span>
                </div>
                <Progress value={s.progress} className="h-2 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((u) => (
              <div key={u.title} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{u.when}</p>
                </div>
                <Badge variant="outline" className="shrink-0 rounded-full">{u.tag}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string }) {
  return (
    <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-soft)" }}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
