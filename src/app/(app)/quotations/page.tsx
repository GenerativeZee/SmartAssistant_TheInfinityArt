import Link from "next/link";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";

export const metadata = { title: S.quotation.title };

const STATUS_ORDER = ["draft", "sent", "followup", "won", "lost"] as const;

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: quotations } = await supabase
    .from("quotations")
    .select("id, number, status, total, sent_at, created_at, clients(name)")
    .order("created_at", { ascending: false });

  const rows = quotations ?? [];
  const byStatus = new Map<string, typeof rows>(STATUS_ORDER.map((s) => [s, []]));
  for (const q of rows) byStatus.get(q.status)?.push(q);

  return (
    <>
      <ScreenHeader title={S.quotation.title} subtitle={`${rows.length} total`} backHref="/clients" />
      <div className="px-4 py-3">
        {rows.length === 0 && <p className="text-sm text-ink-soft text-center py-16">{S.common.empty}</p>}

        {STATUS_ORDER.map((status) => {
          const list = byStatus.get(status) ?? [];
          if (list.length === 0) return null;
          return (
            <div key={status} className="mb-5">
              <h2 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">
                <span>{S.quotation[`status${cap(status)}` as keyof typeof S.quotation] as string}</span>
                <span className="num">{list.length}</span>
              </h2>
              <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
                {list.map((q) => {
                  const flagged = status === "sent" && q.sent_at && isOverThreeDays(q.sent_at);
                  const clientName = (q as unknown as { clients: { name: string } | null }).clients?.name ?? "—";
                  return (
                    <li key={q.id}>
                      <Link
                        href={`/quotations/${q.id}`}
                        className="flex items-center justify-between gap-3 px-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-ink truncate">{clientName}</p>
                          <p className="num text-xs text-ink-faint">
                            {q.number} · {fmtDay(q.created_at)}
                            {flagged && <span className="text-owed font-semibold"> · follow up</span>}
                          </p>
                        </div>
                        <span className="num text-sm font-semibold text-ink shrink-0">{formatMoney(q.total)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isOverThreeDays(sentAt: string): boolean {
  return Date.now() - new Date(sentAt).getTime() > 3 * 24 * 60 * 60 * 1000;
}
