"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExpenseSheet } from "./ExpenseSheet";
import { deleteExpense } from "@/lib/actions/expenses";
import { useToast } from "@/components/ui/Toast";
import { formatMoney } from "@/lib/money";
import { fmtDay, todayIST } from "@/lib/dates";

export interface ExpenseRow {
  id: string;
  category: string;
  amount: number;
  spent_on: string;
  note: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  material: "Material",
  labour: "Labour",
  transport: "Transport",
  rent: "Rent",
  other: "Other",
};

export function ExpensesList({ expenses }: { expenses: ExpenseRow[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const today = todayIST();

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteExpense(id);
      if (res.ok) {
        toast("Removed");
        router.refresh();
      } else {
        toast(res.error, "err");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-dashed border-hairline text-sm text-accent font-medium"
      >
        + Log an expense
      </button>

      {expenses.length === 0 ? (
        <p className="text-sm text-ink-soft text-center py-10">Nothing logged yet.</p>
      ) : (
        <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink">{CATEGORY_LABEL[e.category] ?? e.category}</p>
                <p className="text-xs text-ink-faint truncate">
                  {fmtDay(e.spent_on)}
                  {e.note ? ` · ${e.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="num text-sm font-semibold text-ink">{formatMoney(e.amount)}</span>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  disabled={pending}
                  aria-label="Remove"
                  className="h-7 w-7 grid place-items-center rounded-full text-ink-faint hover:bg-surface-sunken hover:text-owed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ExpenseSheet open={open} onClose={() => setOpen(false)} today={today} />
    </div>
  );
}
