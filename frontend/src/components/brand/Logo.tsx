import { cn } from "@/lib/utils";

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id="forge-lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="oklch(0.62 0.24 295)" />
            <stop offset="1" stopColor="oklch(0.78 0.16 210)" />
          </linearGradient>
        </defs>
        <path
          d="M16 2 L29 9 L29 23 L16 30 L3 23 L3 9 Z"
          stroke="url(#forge-lg)"
          strokeWidth="1.5"
          fill="oklch(0.62 0.24 295 / 0.08)"
        />
        <path d="M10 11 L22 11 L22 14 L14 14 L14 17 L20 17 L20 20 L14 20 L14 23 L10 23 Z" fill="url(#forge-lg)" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">Forge</span>
    </div>
  );
}
