import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/brand/Logo";
import { GradientBorder } from "@/components/brand/GradientBorder";
import { toast } from "sonner";

const searchSchema = z.object({ prompt: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — Forge" },
      { name: "description", content: "Sign in to Forge and start building websites by chatting with AI." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const { prompt } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prompt) sessionStorage.setItem("forge:pendingPrompt", prompt);
  }, [prompt]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const emailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_oklch(0.62_0.24_295/0.15),_transparent_50%),_radial-gradient(circle_at_70%_80%,_oklch(0.78_0.16_210/0.12),_transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Logo size={36} />
        </div>
        <GradientBorder radius="rounded-2xl">
          <div className="rounded-2xl p-8">
            <h1 className="font-display text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to keep building." : "Free forever. No credit card."}
            </p>

            <button
              type="button"
              onClick={googleAuth}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/5"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <div className="h-px flex-1 bg-glass-border" /> or <div className="h-px flex-1 bg-glass-border" />
            </div>

            <form onSubmit={emailAuth} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@work.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl glass px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl glass px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-violet/20 transition-transform hover:scale-[1.01] disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="size-4" /></>}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-6 w-full text-center text-sm text-muted-foreground transition hover:text-foreground"
            >
              {mode === "signin" ? "New to Forge? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </GradientBorder>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
