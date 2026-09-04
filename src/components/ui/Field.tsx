import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="text-sm text-ink-soft">{label}</span>}
      <div className={cn(label && "mt-1")}>{children}</div>
      {hint && <div className="mt-1 text-xs text-ink-faint">{hint}</div>}
    </label>
  );
}

export const inputClass =
  "w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 " +
  "text-ink outline-none focus:border-accent placeholder:text-ink-faint";

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}
