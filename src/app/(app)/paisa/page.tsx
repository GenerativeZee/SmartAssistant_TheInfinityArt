import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { S } from "@/lib/strings";

export const metadata = { title: S.paisa.title };

export default async function PaisaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("client_balances").select("balance").gt("balance", 0);
  const outstanding = (data ?? []).reduce((sum, r) => sum + Number(r.balance), 0);

  return (
    <>
      <ScreenHeader
        title={S.paisa.title}
        subtitle={`${S.aaj.outstanding} ${formatMoney(outstanding)}`}
      />
      <Placeholder milestone="M5" note="Aana hai (ageing) · Aaya (receipts) — paisa tracking yahan aayega." />
    </>
  );
}
