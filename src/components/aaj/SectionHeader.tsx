export function SectionHeader({ title, count, total }: { title: string; count: number; total?: string }) {
  return (
    <h2 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">
      <span>
        {title} · <span className="num">{count}</span>
      </span>
      {total && <span className="num text-ink-soft normal-case font-medium">{total}</span>}
    </h2>
  );
}
