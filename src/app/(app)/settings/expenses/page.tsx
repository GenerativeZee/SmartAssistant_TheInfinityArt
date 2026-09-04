import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ExpensesList } from "@/components/settings/ExpensesList";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, category, amount, spent_on, note")
    .order("spent_on", { ascending: false });

  return (
    <>
      <ScreenHeader title="Expenses" backHref="/settings" />
      <div className="px-4 py-4">
        <ExpensesList expenses={(expenses ?? []).map((e) => ({ ...e, amount: Number(e.amount) }))} />
      </div>
    </>
  );
}
