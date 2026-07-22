import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Award, Flame, Target, BookOpen } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — StudyAI" },
      { name: "description", content: "Manage your StudyAI account, achievements and preferences." },
      { property: "og:title", content: "Profile — StudyAI" },
      { property: "og:description", content: "Your StudyAI profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppLayout title="Profile" subtitle="Manage your account and preferences">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div
              className="grid h-20 w-20 place-items-center rounded-full text-2xl font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              AL
            </div>
            <div>
              <p className="text-lg font-semibold">Alex Lee</p>
              <p className="text-sm text-muted-foreground">alex.lee@school.edu</p>
            </div>
            <Badge variant="secondary" className="rounded-full">Pro plan</Badge>
            <Button variant="outline" className="mt-2 w-full rounded-xl">Edit profile</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Flame, label: "12-day streak" },
              { icon: Award, label: "Quiz master" },
              { icon: Target, label: "Weekly goal" },
              { icon: BookOpen, label: "50 cards" },
            ].map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center">
                <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-soft)" }}>
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium">{a.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Alex Lee" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="alex.lee@school.edu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="school">School</Label>
              <Input id="school" defaultValue="Northfield University" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="major">Major</Label>
              <Input id="major" defaultValue="Biology" />
            </div>
            <div className="md:col-span-2">
              <Button className="rounded-xl">Save changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email reminders", desc: "Daily study reminders" },
              { label: "Push notifications", desc: "Quiz & flashcard nudges" },
              { label: "Weekly summary", desc: "Progress recap every Sunday" },
            ].map((p, i) => (
              <div key={p.label} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch defaultChecked={i !== 1} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
