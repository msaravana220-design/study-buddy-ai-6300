import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — StudyAI" },
      { name: "description", content: "Log in to StudyAI and continue learning." },
      { property: "og:title", content: "Log in — StudyAI" },
      { property: "og:description", content: "Log in to StudyAI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your study session.">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@school.edu" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
          </div>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button asChild className="w-full rounded-xl" size="lg">
          <Link to="/dashboard">Log in</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
