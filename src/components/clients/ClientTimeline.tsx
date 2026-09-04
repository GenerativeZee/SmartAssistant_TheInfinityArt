import { formatMoney } from "@/lib/money";
import { fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";

export type TimelineEvent =
  | { kind: "interaction"; at: string; type: string; summary: string | null; voiceUrl: string | null }
  | { kind: "quotation"; at: string; number: string | null; status: string; total: number }
  | { kind: "job"; at: string; number: string | null; title: string; stage: string }
  | { kind: "payment"; at: string; amount: number; mode: string; receiptNumber: string | null };

const INTERACTION_LABEL: Record<string, string> = {
  visit: "Visit",
  call: "Call",
  whatsapp: "WhatsApp",
  note: "Note",
  voice: "Voice note",
};

export function ClientTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-ink-soft">{S.common.empty}</p>;
  }

  return (
    <ol className="px-4 py-4 space-y-0">
      {events.map((e, i) => (
        <li key={i} className="relative pl-6 pb-5 last:pb-0">
          <span
            className={cn(
              "absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full",
              dotClass(e),
            )}
          />
          {i < events.length - 1 && (
            <span className="absolute left-[4.5px] top-4 bottom-0 w-px bg-hairline" />
          )}
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm text-ink">{title(e)}</p>
            <span className="num text-xs text-ink-faint shrink-0">{fmtDay(e.at)}</span>
          </div>
          {detail(e) && <p className="text-xs text-ink-faint mt-0.5">{detail(e)}</p>}
        </li>
      ))}
    </ol>
  );
}

function dotClass(e: TimelineEvent) {
  if (e.kind === "payment") return "bg-run";
  if (e.kind === "quotation") return e.status === "won" ? "bg-run" : e.status === "lost" ? "bg-owed" : "bg-accent";
  if (e.kind === "job") return e.stage === "delivered" ? "bg-done" : e.stage === "cancelled" ? "bg-owed" : "bg-risk";
  return "bg-ink-faint";
}

function title(e: TimelineEvent) {
  switch (e.kind) {
    case "interaction":
      return INTERACTION_LABEL[e.type] ?? e.type;
    case "quotation":
      return `Quotation ${e.number ?? ""} · ${S.quotation[`status${cap(e.status)}` as keyof typeof S.quotation] ?? e.status}`;
    case "job":
      return `Job ${e.number ?? ""} · ${S.stages[e.stage as keyof typeof S.stages] ?? e.stage}`;
    case "payment":
      return `Payment received`;
  }
}

function detail(e: TimelineEvent) {
  switch (e.kind) {
    case "interaction":
      return e.type === "voice" ? "Voice note" : e.summary;
    case "quotation":
      return formatMoney(e.total);
    case "job":
      return e.title;
    case "payment":
      return `${formatMoney(e.amount)} · ${e.mode}${e.receiptNumber ? ` · ${e.receiptNumber}` : ""}`;
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
