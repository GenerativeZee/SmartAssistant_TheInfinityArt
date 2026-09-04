import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SectionHeader } from "@/components/aaj/SectionHeader";
import { FollowUpRow } from "@/components/aaj/FollowUpRow";
import { MoneyRow } from "@/components/aaj/MoneyRow";
import { DeliveryRow } from "@/components/aaj/DeliveryRow";
import { EmptyFallback } from "@/components/aaj/EmptyFallback";
import { createClient } from "@/lib/supabase/server";
import { todayIST, addDaysIST, firstOfMonthIST, fmtDay } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { S } from "@/lib/strings";

export const metadata = { title: S.aaj.title };

export default async function AajPage() {
  const supabase = await createClient();
  const today = todayIST();
  const tomorrow = addDaysIST(today, 1);

  const [{ data: shop }, { data: openFu }, { data: snoozedFu }, { data: balances }, { data: jobs }] =
    await Promise.all([
      supabase.from("shops").select("name").single(),
      supabase
        .from("follow_ups")
        .select("id, client_id, title, context, due_date, clients(name, phone)")
        .eq("status", "open")
        .lte("due_date", today),
      supabase
        .from("follow_ups")
        .select("id, client_id, title, context, snoozed_to, clients(name, phone)")
        .eq("status", "snoozed")
        .lte("snoozed_to", today),
      supabase
        .from("client_balances")
        .select("client_id, balance, days_outstanding, clients(name, phone)")
        .gt("balance", 0)
        .gte("days_outstanding", 7)
        .order("days_outstanding", { ascending: false }),
      supabase
        .from("jobs")
        .select("id, title, promised_date, clients(name, phone)")
        .not("stage", "in", "(delivered,cancelled)")
        .lte("promised_date", tomorrow)
        .not("promised_date", "is", null),
    ]);

  type FuRow = { id: string; client_id: string; title: string; context: string | null; clients: { name: string; phone: string | null } | null };

  const callItems = [
    ...((openFu ?? []) as unknown as (FuRow & { due_date: string })[]).map((f) => ({
      id: f.id,
      clientId: f.client_id,
      clientName: f.clients?.name ?? "—",
      phone: f.clients?.phone ?? null,
      title: f.title,
      context: f.context,
      effectiveDate: f.due_date,
      overdue: f.due_date < today,
    })),
    ...((snoozedFu ?? []) as unknown as (FuRow & { snoozed_to: string })[]).map((f) => ({
      id: f.id,
      clientId: f.client_id,
      clientName: f.clients?.name ?? "—",
      phone: f.clients?.phone ?? null,
      title: f.title,
      context: f.context,
      effectiveDate: f.snoozed_to,
      overdue: f.snoozed_to < today,
    })),
  ].sort((a, b) => (a.effectiveDate < b.effectiveDate ? -1 : 1));

  const moneyRows = (balances ?? []) as unknown as {
    client_id: string;
    balance: number;
    days_outstanding: number | null;
    clients: { name: string; phone: string | null } | null;
  }[];
  const moneyTotal = moneyRows.reduce((sum, r) => sum + Number(r.balance), 0);

  const deliveryRows = ((jobs ?? []) as unknown as {
    id: string;
    title: string;
    promised_date: string;
    clients: { name: string; phone: string | null } | null;
  }[]).sort((a, b) => (a.promised_date < b.promised_date ? -1 : 1));

  const nothingPending = callItems.length === 0 && moneyRows.length === 0 && deliveryRows.length === 0;

  return (
    <>
      <ScreenHeader title={S.aaj.title} subtitle={`${shop?.name ?? S.appName} · ${fmtDay(today)}`} />

      {nothingPending ? (
        <EmptyFallbackData today={today} />
      ) : (
        <div className="px-4 py-3">
          {callItems.length > 0 && (
            <section className="mb-5">
              <SectionHeader title={S.aaj.callSection} count={callItems.length} />
              <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
                {callItems.map((item) => (
                  <FollowUpRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          )}

          {moneyRows.length > 0 && (
            <section className="mb-5">
              <SectionHeader title={S.aaj.paisaSection} count={moneyRows.length} total={formatMoney(moneyTotal)} />
              <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
                {moneyRows.map((r) => (
                  <MoneyRow
                    key={r.client_id}
                    clientId={r.client_id}
                    clientName={r.clients?.name ?? "—"}
                    phone={r.clients?.phone ?? null}
                    balance={Number(r.balance)}
                    daysOutstanding={r.days_outstanding}
                  />
                ))}
              </ul>
            </section>
          )}

          {deliveryRows.length > 0 && (
            <section className="mb-5">
              <SectionHeader title={S.aaj.deliverySection} count={deliveryRows.length} />
              <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
                {deliveryRows.map((j) => (
                  <DeliveryRow
                    key={j.id}
                    jobId={j.id}
                    clientName={j.clients?.name ?? "—"}
                    phone={j.clients?.phone ?? null}
                    title={j.title}
                    promisedDate={j.promised_date}
                    late={j.promised_date < today}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}

async function EmptyFallbackData({ today }: { today: string }) {
  const supabase = await createClient();
  const monthStart = firstOfMonthIST(today);
  const cutoff = addDaysIST(today, -90);

  const [{ data: monthJobs }, { data: monthPayments }, { data: balances }, { count: newClientsCount }, { data: cold }] =
    await Promise.all([
      supabase.from("jobs").select("total_amount").gte("created_at", monthStart),
      supabase.from("payments").select("amount").gte("received_at", monthStart),
      supabase.from("client_balances").select("balance").gt("balance", 0),
      supabase.from("clients").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      supabase
        .from("clients")
        .select("id, name, last_contacted_at")
        .or(`last_contacted_at.is.null,last_contacted_at.lte.${cutoff}`)
        .order("last_contacted_at", { ascending: true, nullsFirst: true })
        .limit(3),
    ]);

  const earned = (monthJobs ?? []).reduce((s, j) => s + Number(j.total_amount), 0);
  const received = (monthPayments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = (balances ?? []).reduce((s, b) => s + Number(b.balance), 0);

  return (
    <EmptyFallback
      earned={earned}
      received={received}
      outstanding={outstanding}
      newClients={newClientsCount ?? 0}
      coldClients={(cold ?? []).map((c) => ({ id: c.id, name: c.name, lastContactedAt: c.last_contacted_at }))}
    />
  );
}
