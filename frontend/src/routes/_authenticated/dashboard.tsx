import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, LogOut, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GradientBorder } from "@/components/brand/GradientBorder";
import { supabase } from "@/integrations/supabase/client";
import { listProjects, createProject, deleteProject } from "@/lib/projects.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your projects — Forge" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listProjects);
  const create = useServerFn(createProject);
  const del = useServerFn(deleteProject);
  const [prompt, setPrompt] = useState("");

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: () => list(),
  });

  const createMut = useMutation({
    mutationFn: async (name: string) => {
      const p = await create({ data: { name } });
      return p;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      // stash the prompt so workspace fires the first generation
      if (prompt.trim()) sessionStorage.setItem("forge:pendingPrompt", prompt.trim());
      navigate({ to: "/workspace/$projectId", params: { projectId: p.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create project"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleCreate = () => {
    const name = prompt.trim().slice(0, 60) || "Untitled project";
    createMut.mutate(name);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-glass-border/60 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/"><Logo /></Link>
          <button onClick={signOut} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Start something new</h1>
          <p className="mt-1 text-sm text-muted-foreground">Describe what you want. We'll spin up a workspace for it.</p>
        </div>

        <GradientBorder active={prompt.length > 0} radius="rounded-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="flex flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-end"
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A dark landing page for an AI notetaking app, with a pricing table"
              rows={2}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-base placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={createMut.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-violet/20 disabled:opacity-70"
            >
              {createMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> New project</>}
            </button>
          </form>
        </GradientBorder>

        <div className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Your projects</h2>
            <span className="text-xs text-muted-foreground">
              {projects.data?.length ?? 0} total
            </span>
          </div>

          {projects.isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : !projects.data || projects.data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.data.map((p) => (
                <motion.div key={p.id} layout>
                  <div className="group relative overflow-hidden rounded-2xl glass transition hover:-translate-y-0.5">
                    <Link
                      to="/workspace/$projectId"
                      params={{ projectId: p.id }}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-violet/40 to-cyan/30">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_60%)]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="size-8 text-white/70" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-base font-semibold">{p.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Updated {new Date(p.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p.id);
                      }}
                      aria-label={`Delete ${p.name}`}
                      className="absolute right-2 top-2 rounded-lg bg-black/40 p-2 text-white/80 opacity-0 transition group-hover:opacity-100 hover:bg-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl glass p-14 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
        <ArrowRight className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Type a prompt above to spin up your first one.</p>
    </div>
  );
}
