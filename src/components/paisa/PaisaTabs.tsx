"use client";

import { useState } from "react";
import Link from "next/link";
import { PaymentSheet } from "./PaymentSheet";
import { ageingLabel, ageingTone } from "@/lib/ageing";
import { formatMoney } from "@/lib/money";
import { fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";

interface Receivable {
  clientId: string;
  clientName: string;
  balance: number;
  daysOutstanding: number | null;
}
interface Payment {
  id: string;
  amount: number;
  mode: string;
  receiptNumber: string | null;
  receivedAt: string;
  clientName: string;
  jobLabel: string | null;
}
interface ShopInfo {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  upiId: string | null;
  builtByCredit: string | null;
  defaultGreeting: string;
}

const TONE_CLASS: Record<"risk" | "owed" | "faint", string> = {
  risk: "bg-risk-wash text-risk",
  owed: "bg-owed-wash text-owed",
  faint: "bg-surface-sunken text-ink-faint",
};

export function PaisaTabs({
  shop,
  receivables,
  outstanding,
  payments,
  monthTotal,
}: {
  shop: ShopInfo;
  receivables: Receivable[];
  outstanding: number;
  payments: Payment[];
  monthTotal: number;
}) {
  const [tab, setTab] = useState<"toCollect" | "received">("toCollect");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div className="px-4 pt-3 flex items-center gap-2">
        <div className="flex-1 grid grid-cols-2 rounded-full border border-hairline bg-surface p-1">
          <TabButton active={tab === "toCollect"} onClick={() => setTab("toCollect")}>
            {S.paisa.toCollect}
          </TabButton>
          <TabButton active={tab === "received"} onClick={() => setTab("received")}>
            {S.paisa.received}
          </TabButton>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="shrink-0 h-11 w-11 grid place-items-center rounded-full bg-accent text-accent-ink"
          aria-label={S.paisa.addPayment}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {tab === "toCollect" ? (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{receivables.length} clients</p>
            <p className="num text-sm font-semibold text-ink">{formatMoney(outstanding)}</p>
          </div>
          {receivables.length === 0 ? (
            <p className="text-sm text-ink-soft text-center py-16">Nothing outstanding.</p>
          ) : (
            <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
              {receivables.map((r) => (
                <li key={r.clientId}>
                  <Link href={`/clients/${r.clientId}`} className="flex items-center justify-between gap-3 px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{r.clientName}</p>
                      <span
                        className={cn(
                          "inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          TONE_CLASS[ageingTone(r.daysOutstanding)],
                        )}
                      >
                        {ageingLabel(r.daysOutstanding)}
                      </span>
                    </div>
                    <span className="num text-sm font-semibold text-owed shrink-0">{formatMoney(r.balance)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{S.paisa.monthTotal}</p>
            <p className="num text-sm font-semibold text-ink">{formatMoney(monthTotal)}</p>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-ink-soft text-center py-16">{S.common.empty}</p>
          ) : (
            <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{p.clientName}</p>
                    <p className="num text-xs text-ink-faint">
                      {fmtDay(p.receivedAt)} · {S.modes[p.mode as keyof typeof S.modes] ?? p.mode}
                      {p.receiptNumber ? ` · ${p.receiptNumber}` : ""}
                    </p>
                  </div>
                  <span className="num text-sm font-semibold text-run shrink-0">{formatMoney(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <PaymentSheet open={addOpen} onClose={() => setAddOpen(false)} shop={shop} />
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-full text-sm font-medium transition-colors",
        active ? "bg-accent text-accent-ink" : "text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}
