"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";
import { S } from "@/lib/strings";

const MODES = ["cash", "upi", "bank", "cheque"] as const;

/** Delivery action: asks for final payment details before offering the delivery message (§8.5). */
export function DeliverySheet({
  open,
  onClose,
  balance,
  pending,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  balance: number;
  pending: boolean;
  onConfirm: (input: { finalAmount: number; finalMode: (typeof MODES)[number]; note: string }) => void;
}) {
  const [amount, setAmount] = useState(balance > 0 ? String(balance) : "");
  const [mode, setMode] = useState<(typeof MODES)[number]>("cash");
  const [note, setNote] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title={S.job.deliver}>
      <div className="flex flex-col gap-4">
        {balance > 0 && (
          <p className="text-xs text-ink-faint">
            {S.job.balance}: <span className="num text-ink font-medium">{formatMoney(balance)}</span>
          </p>
        )}
        <label className="block">
          <span className="text-sm text-ink-soft">Final payment received (optional)</span>
          <div className="num mt-1 flex items-center rounded-[var(--radius-card)] border border-hairline bg-surface px-3 min-h-[var(--tap)]">
            <span className="text-ink-faint mr-1">₹</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0"
              className="w-full bg-transparent outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm text-ink-soft">{S.paisa.mode}</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as (typeof MODES)[number])}
            className="mt-1 w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 text-sm text-ink outline-none"
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {S.modes[m]}
              </option>
            ))}
          </select>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={S.job.stageNote}
          rows={2}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent resize-none"
        />
        <Button
          onClick={() => onConfirm({ finalAmount: Number(amount) || 0, finalMode: mode, note })}
          disabled={pending}
          className="w-full"
        >
          {pending ? S.common.loading : S.job.deliver}
        </Button>
      </div>
    </Sheet>
  );
}
