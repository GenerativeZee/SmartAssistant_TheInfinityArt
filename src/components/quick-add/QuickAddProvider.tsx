"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { QuickAddForm } from "./QuickAddForm";
import { S } from "@/lib/strings";

type Ctx = { open: () => void };
const QuickAddCtx = createContext<Ctx>({ open: () => {} });
export const useQuickAdd = () => useContext(QuickAddCtx);

export function QuickAddProvider({
  today,
  shopId,
  children,
}: {
  today: string;
  shopId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const doOpen = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <QuickAddCtx.Provider value={{ open: doOpen }}>
      {children}
      <Sheet open={open} onClose={close} title={S.quickAdd.title} tall>
        {open && <QuickAddForm today={today} shopId={shopId} onDone={close} />}
      </Sheet>
    </QuickAddCtx.Provider>
  );
}
