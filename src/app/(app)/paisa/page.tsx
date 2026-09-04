import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PaisaTabs } from "@/components/paisa/PaisaTabs";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { firstOfMonthIST, todayIST } from "@/lib/dates";
import { S } from "@/lib/strings";

export const metadata = { title: S.paisa.title };

export default async function PaisaPage() {
  const supabase = await createClient();

  const [{ data: shop }, { data: balances }, { data: payments }] = await Promise.all([
    supabase
      .from("shops")
      .select(
        "name, address, city, state, pincode, phone, email, gstin, upi_id, built_by_credit, default_greeting, message_templates",
      )
      .single(),
    supabase
      .from("client_balances")
      .select("client_id, balance, days_outstanding, clients(name)")
      .gt("balance", 0)
      .order("days_outstanding", { ascending: false, nullsFirst: false }),
    supabase
      .from("payments")
      .select("id, amount, mode, receipt_number, received_at, client_id, job_id, clients(name), jobs(number, title)")
      .order("received_at", { ascending: false })
      .limit(200),
  ]);

  const receivables = (balances ?? []) as unknown as {
    client_id: string;
    balance: number;
    days_outstanding: number | null;
    clients: { name: string } | null;
  }[];
  const outstanding = receivables.reduce((sum, r) => sum + Number(r.balance), 0);

  const monthStart = firstOfMonthIST();
  const today = todayIST();
  const paymentRows = (payments ?? []) as unknown as {
    id: string;
    amount: number;
    mode: string;
    receipt_number: string | null;
    received_at: string;
    client_id: string;
    job_id: string | null;
    clients: { name: string } | null;
    jobs: { number: string | null; title: string } | null;
  }[];
  const monthTotal = paymentRows
    .filter((p) => p.received_at.slice(0, 10) >= monthStart && p.received_at.slice(0, 10) <= today)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (!shop) return null;

  return (
    <>
      <ScreenHeader title={S.paisa.title} subtitle={`${S.aaj.outstanding} ${formatMoney(outstanding)}`} />
      <PaisaTabs
        shop={{
          name: shop.name,
          address: shop.address,
          city: shop.city,
          state: shop.state,
          pincode: shop.pincode,
          phone: shop.phone,
          email: shop.email,
          gstin: shop.gstin,
          upiId: shop.upi_id,
          builtByCredit: shop.built_by_credit,
          defaultGreeting: shop.default_greeting,
          messageTemplates: shop.message_templates,
        }}
        receivables={receivables.map((r) => ({
          clientId: r.client_id,
          clientName: r.clients?.name ?? "—",
          balance: Number(r.balance),
          daysOutstanding: r.days_outstanding,
        }))}
        outstanding={outstanding}
        payments={paymentRows.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          mode: p.mode,
          receiptNumber: p.receipt_number,
          receivedAt: p.received_at,
          clientName: p.clients?.name ?? "—",
          jobLabel: p.jobs?.number ?? p.jobs?.title ?? null,
        }))}
        monthTotal={monthTotal}
      />
    </>
  );
}
