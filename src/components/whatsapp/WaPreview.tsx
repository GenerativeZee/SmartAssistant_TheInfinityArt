"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { waLink } from "@/lib/messages";
import { S } from "@/lib/strings";

/**
 * Every WhatsApp message opens here first, editable, before it goes out (§7).
 * Confirming opens wa.me with the (possibly edited) text; Shahid presses send
 * inside his own WhatsApp — this app never sends on his behalf.
 */
export function WaPreview({
  open,
  onClose,
  phone,
  message,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  phone: string | null | undefined;
  message: string;
  /** called once the wa.me link has been opened, so the caller can update status */
  onSent?: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={S.actions.whatsapp} tall>
      {/* keyed on the message so a fresh edit starts from the latest text each time this opens */}
      <WaPreviewBody key={message} phone={phone} initialMessage={message} onClose={onClose} onSent={onSent} />
    </Sheet>
  );
}

function WaPreviewBody({
  phone,
  initialMessage,
  onClose,
  onSent,
}: {
  phone: string | null | undefined;
  initialMessage: string;
  onClose: () => void;
  onSent?: () => void;
}) {
  const [text, setText] = useState(initialMessage);
  const link = waLink(phone, text);

  function send() {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
    onSent?.();
    onClose();
  }

  return (
    <div className="flex flex-col gap-3">
      {!phone && <p className="text-sm text-owed">No phone number on file for this client.</p>}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent resize-none"
      />
      <Button onClick={send} disabled={!link} className="w-full">
        {S.actions.whatsapp}
      </Button>
    </div>
  );
}
