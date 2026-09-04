"use client";

import { formatMoney } from "@/lib/money";
import { S } from "@/lib/strings";
import type { QuoteTotals } from "@/lib/pricing";

/** Pinned to the bottom of the builder at all times (§8.4). */
export function TotalsBar({ totals }: { totals: QuoteTotals }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t border-hairline bg-surface/95 backdrop-blur px-4 py-2.5 safe-b">
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span>
          {S.quotation.subtotal} <span className="num">{formatMoney(totals.subtotal)}</span>
        </span>
        <span>
          {S.quotation.gst} <span className="num">{formatMoney(totals.gstAmount)}</span>
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-semibold text-ink">{S.quotation.grandTotal}</span>
        <span className="num text-lg font-bold text-ink">{formatMoney(totals.total)}</span>
      </div>
    </div>
  );
}
