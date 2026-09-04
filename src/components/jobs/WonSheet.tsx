"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { S } from "@/lib/strings";
import { addDaysIST } from "@/lib/dates";
import type { Stage } from "@/lib/validation/jobs";

const START_STAGES: Stage[] = ["design", "approval", "print", "finishing", "installation"];
const MODES = ["cash", "upi", "bank", "cheque"] as const;

/** §6.4 — two inputs, one transaction: promised date + optional advance. */
export function WonSheet({
  open,
  onClose,
  today,
  pending,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  today: string;
  pending: boolean;
  onConfirm: (input: { promisedDate: string; startingStage: Stage; advanceAmount: number; advanceMode: (typeof MODES)[number] }) => void;
}) {
  const [promisedDate, setPromisedDate] = useState(addDaysIST(today, 7));
  const [startingStage, setStartingStage] = useState<Stage>("design");
  const [advance, setAdvance] = useState("");
  const [mode, setMode] = useState<(typeof MODES)[number]>("cash");

  return (
    <Sheet open={open} onClose={onClose} title={S.won.title}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm text-ink-soft">{S.won.promisedDate}</span>
          <input
            type="date"
            min={today}
            value={promisedDate}
            onChange={(e) => setPromisedDate(e.target.value)}
            className="num mt-1 w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 text-ink outline-none focus:border-accent"
          />
        </label>

        <div>
          <span className="text-sm text-ink-soft">{S.won.startStage}</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {START_STAGES.map((s) => (
              <Chip key={s} size="sm" active={startingStage === s} onClick={() => setStartingStage(s)}>
                {S.stages[s]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm text-ink-soft">{S.won.advance}</span>
          <div className="mt-1.5 flex gap-2">
            <div className="num flex-1 flex items-center rounded-[var(--radius-card)] border border-hairline bg-surface px-3 min-h-[var(--tap)]">
              <span className="text-ink-faint mr-1">₹</span>
              <input
                inputMode="decimal"
                value={advance}
                onChange={(e) => setAdvance(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0"
                className="w-full bg-transparent outline-none"
              />
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as (typeof MODES)[number])}
              className="rounded-[var(--radius-card)] border border-hairline bg-surface px-2 text-sm text-ink outline-none min-h-[var(--tap)]"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {S.modes[m]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={() =>
            onConfirm({
              promisedDate,
              startingStage,
              advanceAmount: Number(advance) || 0,
              advanceMode: mode,
            })
          }
          disabled={pending || !promisedDate}
          className="w-full"
        >
          {pending ? S.common.loading : S.won.confirm}
        </Button>
      </div>
    </Sheet>
  );
}
