"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** allow the sheet to grow tall (forms) vs. hug content (menus) */
  tall?: boolean;
}

/**
 * Bottom sheet. Thumb-reachable, slides up from the bottom edge, backdrop tap
 * and Esc close it, body scroll is locked while open. No external dependency.
 */
export function Sheet({ open, onClose, title, children, tall }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 animate-[fade_.15s_ease-out]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg mx-auto rounded-t-2xl bg-surface outline-none",
          "animate-[slideup_.18s_ease-out] safe-b",
          tall ? "max-h-[92dvh]" : "max-h-[80dvh]",
          "flex flex-col",
        )}
      >
        <div className="flex items-center justify-center pt-2">
          <span className="h-1 w-9 rounded-full bg-hairline" />
        </div>
        {title && (
          <h2 className="head text-lg text-ink px-5 pt-2 pb-3 border-b border-hairline">{title}</h2>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>

      <style>{`
        @keyframes slideup { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
