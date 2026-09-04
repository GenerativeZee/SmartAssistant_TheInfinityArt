"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { addExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/validation/expenses";

const CATEGORY_LABEL: Record<(typeof EXPENSE_CATEGORIES)[number], string> = {
  material: "Material",
  labour: "Labour",
  transport: "Transport",
  rent: "Rent",
  other: "Other",
};

export function ExpenseSheet({ open, onClose, today }: { open: boolean; onClose: () => void; today: string }) {
  return (
    <Sheet open={open} onClose={onClose} title="Log an expense">
      {open && <ExpenseForm onDone={onClose} today={today} />}
    </Sheet>
  );
}

function ExpenseForm({ onDone, today }: { onDone: () => void; today: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number]>("material");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  function save() {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast("Enter an amount", "err");
      return;
    }
    startTransition(async () => {
      const res = await addExpense({ category, amount: amt, spentOn: date, note });
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      toast("Saved");
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm text-ink-soft">Category</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-sm text-ink-soft">Amount</span>
        <div className="num mt-1 flex items-center rounded-[var(--radius-card)] border border-hairline bg-surface px-3 min-h-[var(--tap)]">
          <span className="text-ink-faint mr-1">₹</span>
          <input
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0"
            className="w-full bg-transparent outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-sm text-ink-soft">Date</span>
        <input
          type="date"
          max={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="num mt-1 w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 text-ink outline-none"
        />
      </label>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        rows={2}
        className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent resize-none"
      />

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
