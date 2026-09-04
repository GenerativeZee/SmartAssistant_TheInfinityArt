"use client";

import { useState } from "react";
import { Sheet } from "./Sheet";
import { IconPlus } from "./icons";
import { S } from "@/lib/strings";

/**
 * Floating "+" present on every tab. Opens the quick-add sheet.
 * M1: placeholder content — the 10-second capture form lands in M2.
 */
export function Fab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={S.quickAdd.title}
        className="fixed z-40 right-4 bottom-[calc(var(--tap)+22px)] h-14 w-14 rounded-full bg-accent text-accent-ink shadow-lg grid place-items-center active:scale-95 transition-transform"
      >
        <IconPlus width={26} height={26} />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={S.quickAdd.title} tall>
        <div className="py-10 text-center text-ink-soft">
          <p className="text-sm">Quick add form M2 me aayega.</p>
        </div>
      </Sheet>
    </>
  );
}
