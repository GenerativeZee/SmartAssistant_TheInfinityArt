import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";

interface ColdClient {
  id: string;
  name: string;
  lastContactedAt: string | null;
}

/** §6.6 — the screen is never blank, even with nothing pending today. */
export function EmptyFallback({
  earned,
  received,
  outstanding,
  newClients,
  coldClients,
}: {
  earned: number;
  received: number;
  outstanding: number;
  newClients: number;
  coldClients: ColdClient[];
}) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-4 text-center">
        <p className="head text-sm text-ink">{S.aaj.allClearTitle}</p>
      </div>

      <div className="mt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">{S.aaj.monthSoFar}</h2>
        <div className="grid grid-cols-2 gap-2">
          <Stat label={S.aaj.earned} value={formatMoney(earned)} />
          <Stat label={S.aaj.received} value={formatMoney(received)} />
          <Stat label={S.aaj.outstanding} value={formatMoney(outstanding)} tone="owed" />
          <Stat label={S.aaj.newClients} value={String(newClients)} />
        </div>
      </div>

      {coldClients.length > 0 && (
        <div className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">{S.aaj.coldClients}</h2>
          <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
            {coldClients.map((c) => (
              <li key={c.id}>
                <Link href={`/clients/${c.id}`} className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm text-ink">{c.name}</span>
                  <span className="text-xs text-ink-faint">
                    {c.lastContactedAt ? fmtDay(c.lastContactedAt) : "Never"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "owed" }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-3">
      <p className="text-[10px] text-ink-faint uppercase tracking-wide">{label}</p>
      <p className={`num text-base font-semibold mt-0.5 ${tone === "owed" ? "text-owed" : "text-ink"}`}>{value}</p>
    </div>
  );
}
