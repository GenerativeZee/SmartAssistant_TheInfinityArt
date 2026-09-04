"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { S } from "@/lib/strings";
import type { Stage } from "@/lib/validation/jobs";

export function AdvanceStageSheet({
  open,
  onClose,
  toStage,
  pending,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  toStage: Stage | null;
  pending: boolean;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title={toStage ? `Move to ${S.stages[toStage]}` : ""}>
      <div className="flex flex-col gap-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={S.job.stageNote}
          rows={3}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent resize-none"
        />
        <Button onClick={() => onConfirm(note)} disabled={pending} className="w-full">
          {pending ? S.common.loading : S.job.advanceStage}
        </Button>
      </div>
    </Sheet>
  );
}
