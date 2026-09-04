import Link from "next/link";
import { Suspense } from "react";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ClientSearch } from "@/components/clients/ClientSearch";
import { BalanceTag } from "@/components/clients/BalanceTag";
import { createClient } from "@/lib/supabase/server";
import { formatPhone, telHref } from "@/lib/phone";
import { fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";
import { IconPhone, IconChat } from "@/components/ui/icons";
import { waLink } from "@/lib/messages";

export const metadata = { title: S.tabs.clients };

export default function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <>
      <ScreenHeader title={S.tabs.clients} />
      <div className="px-4 pt-3">
        <Suspense>
          <ClientSearch />
        </Suspense>
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <ClientList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ClientList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("id, name, company, phone, last_contacted_at")
    .order("last_contacted_at", { ascending: false, nullsFirst: false })
    .limit(200);

  if (q && q.trim()) {
    const digits = q.replace(/\D/g, "");
    const term = digits.length >= 3 ? digits : q.trim();
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,company.ilike.%${term}%`);
  }

  const { data: clients } = await query;
  const ids = (clients ?? []).map((c) => c.id);

  const balances = new Map<string, number>();
  if (ids.length) {
    const { data: bal } = await supabase
      .from("client_balances")
      .select("client_id, balance")
      .in("client_id", ids);
    (bal ?? []).forEach((b) => balances.set(b.client_id, Number(b.balance)));
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-ink-soft">
        {q ? "Koi client nahi mila." : S.common.empty}
      </div>
    );
  }

  return (
    <ul className="px-4 py-2 divide-y divide-hairline">
      {clients.map((c) => (
        <li key={c.id} className="flex items-center gap-3 py-3">
          <Link href={`/clients/${c.id}`} className="flex-1 min-w-0">
            <p className="text-ink font-medium truncate">{c.name}</p>
            <p className="text-xs text-ink-faint truncate">
              {c.company ? `${c.company} · ` : ""}
              {formatPhone(c.phone)}
              {c.last_contacted_at ? ` · ${fmtDay(c.last_contacted_at)}` : ""}
            </p>
          </Link>
          <BalanceTag balance={balances.get(c.id) ?? 0} />
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={telHref(c.phone)}
              aria-label={S.actions.call}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
              onClick={(e) => e.stopPropagation()}
            >
              <IconPhone width={18} height={18} />
            </a>
            <a
              href={waLink(c.phone)}
              target="_blank"
              rel="noreferrer"
              aria-label={S.actions.whatsapp}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
              onClick={(e) => e.stopPropagation()}
            >
              <IconChat width={18} height={18} />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="px-4 py-2 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 rounded-[var(--radius-card)] bg-surface-sunken animate-pulse" />
      ))}
    </div>
  );
}
