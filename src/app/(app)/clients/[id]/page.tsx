import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { BalanceTag } from "@/components/clients/BalanceTag";
import { NewActionButtons } from "@/components/clients/NewActionButtons";
import { ClientTimeline, type TimelineEvent } from "@/components/clients/ClientTimeline";
import { createClient } from "@/lib/supabase/server";
import { formatPhone, telHref } from "@/lib/phone";
import { formatMoney } from "@/lib/money";
import { waLink, templates } from "@/lib/messages";
import { S } from "@/lib/strings";
import { IconPhone, IconChat } from "@/components/ui/icons";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: balance }, { data: shop }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase.from("client_balances").select("*").eq("client_id", id).maybeSingle(),
    supabase.from("shops").select("default_greeting, whatsapp_number").maybeSingle(),
  ]);

  if (!client) notFound();

  const [{ data: interactions }, { data: quotations }, { data: jobs }, { data: payments }] =
    await Promise.all([
      supabase
        .from("interactions")
        .select("type, summary, voice_url, occurred_at")
        .eq("client_id", id)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("quotations")
        .select("id, number, status, total, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id, number, title, stage, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("amount, mode, receipt_number, received_at")
        .eq("client_id", id)
        .order("received_at", { ascending: false }),
    ]);

  const events: TimelineEvent[] = [
    ...(interactions ?? []).map((i): TimelineEvent => ({
      kind: "interaction",
      at: i.occurred_at,
      type: i.type,
      summary: i.summary,
      voiceUrl: i.voice_url,
    })),
    ...(quotations ?? []).map((q): TimelineEvent => ({
      kind: "quotation",
      id: q.id,
      at: q.created_at,
      number: q.number,
      status: q.status,
      total: Number(q.total),
    })),
    ...(jobs ?? []).map((j): TimelineEvent => ({
      kind: "job",
      id: j.id,
      at: j.created_at,
      number: j.number,
      title: j.title,
      stage: j.stage,
    })),
    ...(payments ?? []).map((p): TimelineEvent => ({
      kind: "payment",
      at: p.received_at,
      amount: Number(p.amount),
      mode: p.mode,
      receiptNumber: p.receipt_number,
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  const greeting = shop?.default_greeting ?? "ji";
  const message = templates.hello({ name: client.name, greeting, shopName: "The Infinity Art" });

  return (
    <>
      <ScreenHeader title={client.name} subtitle={client.company ?? undefined} backHref="/clients" />

      <div className="px-4 pt-3">
        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="num text-sm text-ink-soft">{formatPhone(client.phone)}</p>
              {client.source && <p className="text-xs text-ink-faint mt-0.5">{sourceLabel(client.source)}</p>}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={telHref(client.phone)}
                className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-ink-soft"
                aria-label={S.actions.call}
              >
                <IconPhone width={18} height={18} />
              </a>
              <a
                href={waLink(client.phone, message)}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-ink-soft"
                aria-label={S.actions.whatsapp}
              >
                <IconChat width={18} height={18} />
              </a>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
            <div>
              <p className="text-xs text-ink-faint">{S.client.totalBusiness}</p>
              <p className="num text-lg text-ink font-semibold">
                {formatMoney(balance?.total_billed ?? 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-faint">{S.client.balance}</p>
              <p className="num text-lg font-semibold">
                <BalanceTag balance={Number(balance?.balance ?? 0)} size="md" />
                {!balance?.balance && <span className="text-ink">{formatMoney(0)}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <NewActionButtons clientId={client.id} />

      <div className="mt-2">
        <h2 className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {S.client.timeline}
        </h2>
        <ClientTimeline events={events} />
      </div>
    </>
  );
}

function sourceLabel(source: string) {
  const map: Record<string, string> = {
    walk_in: "Walk-in",
    reference: "Reference",
    instagram: "Instagram",
    google: "Google",
    whatsapp: "WhatsApp",
    repeat: "Repeat client",
    other: "Other",
  };
  return map[source] ?? source;
}
