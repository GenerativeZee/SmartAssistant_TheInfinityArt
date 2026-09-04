import { S } from "@/lib/strings";

export function Placeholder({ note }: { note: string }) {
  return (
    <div className="px-6 py-20 text-center">
      <p className="head text-sm text-ink-soft">{S.common.comingSoon}</p>
      <p className="mt-2 text-sm text-ink-faint max-w-xs mx-auto">{note}</p>
    </div>
  );
}
