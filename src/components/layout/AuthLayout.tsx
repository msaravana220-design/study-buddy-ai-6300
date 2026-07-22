import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Visual */}
        <div className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between" style={{ background: "var(--gradient-primary)" }}>
          <div className="flex items-center gap-2 text-primary-foreground">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">StudyAI</span>
          </div>
          <div className="relative z-10 text-primary-foreground">
            <h2 className="max-w-md text-4xl font-semibold leading-tight">Learn smarter with your personal AI tutor.</h2>
            <p className="mt-4 max-w-md text-primary-foreground/85">
              Turn notes into summaries, flashcards and quizzes in seconds.
            </p>
          </div>
          <div aria-hidden className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
          <div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">StudyAI</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
