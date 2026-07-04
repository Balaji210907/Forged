import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Forge" },
      { name: "description", content: "Free, Pro, and Team plans for Forge — the AI website builder that ships polished sites in seconds." },
      { property: "og:title", content: "Pricing — Forge" },
      { property: "og:description", content: "Free forever. Pro at $20/mo. Team from $60/user." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const tiers = [
    { name: "Free", price: "$0", per: "forever", desc: "For hobby projects and quick experiments.", features: ["20 generations / month", "Public projects", "Forge subdomain", "Community support"] },
    { name: "Pro", price: "$20", per: "per month", desc: "For designers, indie makers, and startup teams.", featured: true, features: ["Unlimited generations", "Private projects", "Custom domains", "Priority chat support", "GitHub sync", "Export code as zip"] },
    { name: "Team", price: "$60", per: "user / month", desc: "For teams building products together.", features: ["Everything in Pro", "Shared workspaces", "Roles & permissions", "SSO (SAML)", "Audit logs", "Dedicated support"] },
  ];
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
          <p className="text-sm uppercase tracking-widest text-violet">Pricing</p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">Ship more. Pay less.</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={"relative rounded-2xl p-6 " + (t.featured ? "glass ring-brand" : "glass")}>
              {t.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">Popular</span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.per}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-gradient-brand" />{f}</li>
                ))}
              </ul>
              <Link to="/auth" className={"mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium " + (t.featured ? "bg-gradient-brand text-primary-foreground" : "glass text-foreground")}>Get started</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
