import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Code2, GitBranch, Rocket, Github } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { GradientBorder } from "@/components/brand/GradientBorder";
import { ParticleField } from "@/components/brand/ParticleField";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav />
      <Hero prompt={prompt} setPrompt={setPrompt} />
      <Marquee />
      <Features />
      <Comparison />
      <Pricing />
      <FooterCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass px-4 py-2.5 sm:px-6">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#compare" className="transition hover:text-foreground">Compare</a>
          <Link to="/pricing" className="transition hover:text-foreground">Pricing</Link>
          <Link to="/templates" className="transition hover:text-foreground">Templates</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground">Sign in</Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg shadow-violet/20 transition-transform hover:scale-[1.02]"
          >
            Start building <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero({ prompt, setPrompt }: { prompt: string; setPrompt: (v: string) => void }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center pt-24">
      <ParticleField className="absolute inset-0 h-full w-full opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_75%)]" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground"
        >
          <Sparkles className="size-3 text-violet" />
          Powered by frontier models • Free tier included
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Chat your website <br />
          <span className="text-gradient">into existence.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          Describe what you want. Forge builds it, previews it live, and keeps iterating with you — real code, real sites, in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <PromptBox prompt={prompt} setPrompt={setPrompt} />
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            {[
              "SaaS landing for a fintech startup, dark theme",
              "Portfolio for a product designer",
              "Pricing page with 3 tiers, glass cards",
              "Recipe blog homepage",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="rounded-full glass px-3 py-1 text-muted-foreground transition hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PromptBox({ prompt, setPrompt }: { prompt: string; setPrompt: (v: string) => void }) {
  return (
    <GradientBorder active={prompt.length > 0} radius="rounded-2xl">
      <form
        action="/auth"
        className="flex flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="prompt" value={prompt} />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the site you want to build…"
          rows={2}
          className="flex-1 resize-none bg-transparent px-2 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-violet/20 transition-transform hover:scale-[1.02]"
        >
          Generate <ArrowRight className="size-4" />
        </button>
      </form>
    </GradientBorder>
  );
}

function Marquee() {
  const items = ["Next.js quality", "Tailwind + shadcn", "React 19", "Live preview", "One-click deploy", "Version history", "Team collaboration", "Export code"];
  return (
    <div className="border-y border-glass-border/60 bg-surface/40 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-xs uppercase tracking-widest text-muted-foreground">
        {items.map((i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    { icon: Zap, title: "Instant preview", body: "Real HTML in a sandboxed iframe. Hot-reloads as the model streams." },
    { icon: Code2, title: "Real code you own", body: "Full file tree with Monaco editor. Edit manually, export, deploy — no lock-in." },
    { icon: GitBranch, title: "Checkpoints", body: "Every turn is a snapshot. Rewind visually, branch experiments, restore instantly." },
    { icon: Rocket, title: "One-click deploy", body: "Publish to your Forge subdomain. Custom domains on Pro." },
    { icon: Sparkles, title: "Design that ships", body: "Curated component patterns so first-generation output looks designed, not default." },
    { icon: Github, title: "Push to GitHub", body: "Sync any project to a repo. CI/CD ready." },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 text-center">
        <p className="text-sm uppercase tracking-widest text-violet">Features</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Everything you need to ship</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="group relative overflow-hidden rounded-2xl glass p-6 transition hover:-translate-y-0.5">
            <f.icon className="mb-4 size-6 text-violet transition group-hover:text-cyan" />
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Comparison() {
  const cols = [
    { name: "Forge", highlight: true },
    { name: "Lovable" },
    { name: "Bolt.new" },
    { name: "Bubble" },
  ];
  const rows: Array<[string, (string | boolean)[]]> = [
    ["Chat-to-website", [true, true, true, false]],
    ["Live preview with hot reload", [true, true, true, false]],
    ["Full code export", [true, true, true, false]],
    ["Visual checkpoint history", [true, "Basic", "Basic", false]],
    ["Design-system defaults", ["Curated", "Generic", "Generic", "Templates"]],
    ["One-click deploy", [true, true, true, true]],
    ["Free tier", [true, true, true, "Limited"]],
  ];
  return (
    <section id="compare" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-widest text-cyan">Compare</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Forge vs the field</h2>
      </div>
      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-glass-border/60">
            <tr>
              <th className="px-6 py-4 text-muted-foreground"></th>
              {cols.map((c) => (
                <th key={c.name} className={"px-6 py-4 font-semibold " + (c.highlight ? "text-gradient" : "text-foreground")}>
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, values]) => (
              <tr key={label} className="border-b border-glass-border/40 last:border-0">
                <td className="px-6 py-3.5 text-muted-foreground">{label}</td>
                {values.map((v, i) => (
                  <td key={i} className={"px-6 py-3.5 " + (cols[i].highlight ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {typeof v === "boolean" ? (v ? "✓" : "—") : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Free", price: "$0", per: "forever", features: ["20 generations / mo", "Public projects", "Forge subdomain", "Community support"] },
    { name: "Pro", price: "$20", per: "per month", features: ["Unlimited generations", "Private projects", "Custom domains", "Priority support"], featured: true },
    { name: "Team", price: "$60", per: "per user / mo", features: ["Everything in Pro", "Shared workspaces", "Roles & permissions", "SSO"] },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-widest text-violet">Pricing</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Simple, honest pricing</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={
              "relative rounded-2xl p-6 transition " +
              (t.featured ? "glass ring-brand" : "glass")
            }
          >
            {t.featured && (
              <span className="absolute right-4 top-4 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                Popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold">{t.price}</span>
              <span className="text-sm text-muted-foreground">{t.per}</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-gradient-brand" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={
                "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition " +
                (t.featured
                  ? "bg-gradient-brand text-primary-foreground hover:scale-[1.02]"
                  : "glass text-foreground hover:bg-white/5")
              }
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Your next site is <span className="text-gradient">one prompt</span> away.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Start free. No credit card. Ship something you're proud of in the next 15 minutes.</p>
      <Link
        to="/auth"
        className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-6 py-3 text-base font-medium text-primary-foreground shadow-lg shadow-violet/20 transition-transform hover:scale-[1.02]"
      >
        Start building <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl border-t border-glass-border/60 px-6 py-10 text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo />
        <p>© {new Date().getFullYear()} Forge — Built with love and Lovable.</p>
      </div>
    </footer>
  );
}
