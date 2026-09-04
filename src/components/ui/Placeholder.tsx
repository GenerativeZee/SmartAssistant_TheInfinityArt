export function Placeholder({ milestone, note }: { milestone: string; note: string }) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="num text-xs tracking-widest text-accent">{milestone}</p>
      <p className="mt-2 text-sm text-ink-soft">{note}</p>
    </div>
  );
}
