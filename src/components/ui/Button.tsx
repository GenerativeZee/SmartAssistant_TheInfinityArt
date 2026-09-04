import { cn } from "@/lib/cn";

type Variant = "primary" | "surface" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink",
  surface: "bg-surface text-ink border border-hairline",
  ghost: "bg-transparent text-ink-soft",
  danger: "bg-surface text-owed border border-hairline",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "min-h-[var(--tap)] px-4 rounded-[var(--radius-card)] font-medium",
        "inline-flex items-center justify-center gap-2 select-none",
        "active:scale-[.99] transition-transform disabled:opacity-55 disabled:active:scale-100",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
