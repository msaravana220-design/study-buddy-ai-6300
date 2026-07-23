import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, GraduationCap, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — StudyAI" },
      { name: "description", content: "Manage your StudyAI account and study preferences." },
      { property: "og:title", content: "Profile — StudyAI" },
      { property: "og:description", content: "Manage your StudyAI account and study preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@studyai.app");
  const [school, setSchool] = useState("Northfield University");
  const [emailNotif, setEmailNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <AppLayout title="Profile" subtitle="Your account and preferences">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div
              className="grid h-24 w-24 place-items-center rounded-full text-2xl font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              AM
            </div>
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {email}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> {school}
              </p>
            </div>
            <Button variant="outline" className="w-full rounded-xl">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Account information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="school">School</Label>
                <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} className="rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <Button className="rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your StudyAI experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Study reminders and weekly recaps</p>
                </div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Use a darker theme for late-night sessions</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
