import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Animated gradient border shell. Wrap any block to give it a violet→cyan
 * animated outline (used on the prompt box while generating).
 */
export function GradientBorder({
  children,
  className,
  active = false,
  radius = "rounded-2xl",
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  radius?: string;
}) {
  return (
    <div
      className={cn(
        "relative p-[1.5px]",
        radius,
        active ? "animate-gradient-border" : "",
        className,
      )}
      style={{
        background: active
          ? "linear-gradient(120deg, oklch(0.62 0.24 295), oklch(0.78 0.16 210), oklch(0.62 0.24 295))"
          : "linear-gradient(120deg, oklch(1 0 0 / 0.15), oklch(1 0 0 / 0.06))",
        backgroundSize: active ? "300% 300%" : "100% 100%",
      }}
    >
      <div className={cn("relative h-full w-full glass", radius)}>{children}</div>
    </div>
  );
}
