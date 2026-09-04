"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

export function CancelJobSheet({
  open,
  onClose,
  pending,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  pending: boolean;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title="Cancel this job?">
      <div className="flex flex-col gap-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why is it being cancelled?"
          rows={3}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent resize-none"
        />
        <Button variant="danger" onClick={() => onConfirm(note)} disabled={pending} className="w-full">
          {pending ? "Cancelling…" : "Cancel job"}
        </Button>
      </div>
    </Sheet>
  );
}
