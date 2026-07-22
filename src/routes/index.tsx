import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles, Layers, ListChecks } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyAI — Your AI Study Companion" },
      { name: "description", content: "Turn notes into AI summaries, flashcards and quizzes. Study smarter with StudyAI." },
      { property: "og:title", content: "StudyAI — Your AI Study Companion" },
      { property: "og:description", content: "Turn notes into AI summaries, flashcards and quizzes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">StudyAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Log in</Link>
          <Link to="/register" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95">
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered study companion
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Study smarter, not harder.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Upload your notes and let StudyAI turn them into summaries, flashcards and quizzes tailored to how you learn.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95">
            Open Dashboard
          </Link>
          <Link to="/register" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent">
            Create account
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "AI Summaries", desc: "Condense long notes into clear key points." },
            { icon: Layers, title: "Flashcards", desc: "Auto-generated cards for active recall." },
            { icon: ListChecks, title: "Quizzes", desc: "Test yourself and track your progress." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 text-left shadow-[var(--shadow-soft)]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
