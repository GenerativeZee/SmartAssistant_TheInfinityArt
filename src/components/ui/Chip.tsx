"use client";

import { cn } from "@/lib/cn";

export function Chip({
  active,
  onClick,
  children,
  size = "md",
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border font-medium transition-colors",
        size === "md" ? "min-h-[var(--tap)] px-4 text-sm" : "h-8 px-3 text-xs",
        active
          ? "border-accent bg-accent-wash text-accent"
          : "border-hairline bg-surface text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}
