import Link from "next/link";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { createClient, getProfile } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { S } from "@/lib/strings";

export const metadata = { title: S.settings.title };

const LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/settings/profile", label: S.settings.shopProfile },
  { href: "/settings/rate-card", label: S.settings.rateCard },
  { href: "/settings/templates", label: S.settings.templates },
  { href: "/settings/expenses", label: "Expenses" },
  { href: "/quotations", label: "All quotations" },
  { href: "/api/export", label: S.settings.exportExcel, external: true },
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const profile = await getProfile();
  const { data: shop } = await supabase.from("shops").select("name, logo_url").single();

  return (
    <>
      <ScreenHeader title={S.settings.title} hideSettings />
      <div className="px-4 py-4">
        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-4 flex items-center gap-3">
          {shop?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.logo_url} alt={shop.name} className="h-12 w-12 rounded-[10px] object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-[10px] bg-ink grid place-items-center text-accent-wash text-xs font-bold">
              INF
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{shop?.name ?? S.appName}</p>
            <p className="text-xs text-ink-faint truncate">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {LINKS.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 text-sm text-ink"
              >
                {l.label}
                <span className="text-ink-faint">↓</span>
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 text-sm text-ink"
              >
                {l.label}
                <span className="text-ink-faint">→</span>
              </Link>
            ),
          )}
        </div>

        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface text-owed font-medium"
          >
            {S.auth.signOut}
          </button>
        </form>
      </div>
    </>
  );
}
