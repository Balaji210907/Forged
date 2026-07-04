import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Forge" },
      { name: "description", content: "Start from a curated Forge template — SaaS landing, portfolio, dashboard, blog, e-commerce, docs." },
      { property: "og:title", content: "Templates — Forge" },
      { property: "og:description", content: "Curated starters so your first generation looks like a senior designer built it." },
    ],
  }),
  component: TemplatesPage,
});

const TEMPLATES = [
  { name: "SaaS Landing", desc: "Hero, features, pricing, testimonials.", tag: "Marketing", gradient: "from-violet to-cyan" },
  { name: "Product Studio", desc: "Portfolio for a designer or dev studio.", tag: "Portfolio", gradient: "from-cyan to-violet" },
  { name: "Analytics Dashboard", desc: "Charts, KPI cards, sidebar nav.", tag: "App", gradient: "from-violet to-pink-500" },
  { name: "Editorial Blog", desc: "Long-form magazine layout with archive.", tag: "Blog", gradient: "from-cyan to-teal-400" },
  { name: "E-commerce", desc: "Category grid, product detail, cart drawer.", tag: "Store", gradient: "from-violet to-cyan" },
  { name: "Documentation", desc: "Sidebar + search, code samples, dark mode.", tag: "Docs", gradient: "from-cyan to-violet" },
];

function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="text-sm uppercase tracking-widest text-cyan">Templates</p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">Skip the blank page.</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Curated starters. Pick one, then keep chatting to make it yours.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link key={t.name} to="/auth" className="group overflow-hidden rounded-2xl glass transition hover:-translate-y-0.5">
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${t.gradient} p-6`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_60%)]" />
                <span className="relative inline-flex rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                  {t.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
