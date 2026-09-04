"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { IconCheck } from "./icons";

type Toast = { id: number; text: string; tone: "ok" | "err" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "err") => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const show = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed inset-x-0 bottom-[calc(var(--tap)+72px)] z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cnToast(t.tone)}
          >
            {t.tone === "ok" && <IconCheck width={16} height={16} />}
            <span className="text-sm">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function cnToast(tone: "ok" | "err") {
  return [
    "flex items-center gap-2 rounded-full px-4 py-2 shadow-lg animate-[slideup_.16s_ease-out]",
    tone === "ok" ? "bg-ink text-ink-invert" : "bg-owed text-white",
  ].join(" ");
}
