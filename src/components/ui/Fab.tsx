"use client";

import { useQuickAdd } from "@/components/quick-add/QuickAddProvider";
import { IconPlus } from "./icons";
import { S } from "@/lib/strings";

/** Floating "+" present on every tab. Opens the quick-add sheet (§8.2). */
export function Fab() {
  const { open } = useQuickAdd();

  return (
    <button
      onClick={open}
      aria-label={S.quickAdd.title}
      className="fixed z-40 right-4 bottom-[calc(var(--tap)+22px)] h-14 w-14 rounded-full bg-accent text-accent-ink shadow-lg grid place-items-center active:scale-95 transition-transform"
    >
      <IconPlus width={26} height={26} />
    </button>
  );
}
