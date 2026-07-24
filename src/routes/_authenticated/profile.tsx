import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, LogOut, User as UserIcon } from "lucide-react";

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

function getInitials(name: string, email: string) {
  const source = (name || email || "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [emailNotif, setEmailNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const user = data.user;
      if (user) {
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const displayName =
          (meta.full_name as string) ||
          (meta.name as string) ||
          (meta.user_name as string) ||
          (user.email ? user.email.split("@")[0] : "");
        setName(displayName);
        setEmail(user.email ?? "");
        setAvatarUrl(
          (meta.avatar_url as string) || (meta.picture as string) || null,
        );
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <AppLayout title="Profile" subtitle="Your account and preferences">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || email || "Profile"}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div
                className="grid h-24 w-24 place-items-center rounded-full text-2xl font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? <UserIcon className="h-8 w-8" /> : getInitials(name, email)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {loading ? "Loading…" : name || "Unnamed user"}
              </h2>
              {email && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {email}
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full rounded-xl" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Account information</CardTitle>
              <CardDescription>Your signed-in account details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <p className="text-xs font-medium text-muted-foreground">Full name</p>
                <p className="text-sm">{loading ? "—" : name || "Not set"}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{loading ? "—" : email || "Not set"}</p>
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
