import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { createClient, getProfile } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { S } from "@/lib/strings";

export const metadata = { title: S.settings.title };

export default async function SettingsPage() {
  const supabase = await createClient();
  const profile = await getProfile();
  const { data: shop } = await supabase.from("shops").select("*").single();

  const rows: [string, string | null | undefined][] = [
    [S.settings.shopProfile, shop?.name],
    ["Legal name", shop?.legal_name],
    ["Address", [shop?.address, shop?.city, shop?.state, shop?.pincode].filter(Boolean).join(", ")],
    ["Phone", shop?.phone],
    ["WhatsApp", shop?.whatsapp_number],
    [S.settings.gstin, shop?.gstin],
    [S.settings.upiId, shop?.upi_id],
    [S.settings.gstRate, shop ? `${shop.default_gst_rate}%` : null],
    [S.settings.sqftRounding, shop?.sqft_rounding],
    [S.settings.greeting, shop?.default_greeting],
    ["Signed in as", profile?.email],
  ];

  return (
    <>
      <ScreenHeader title={S.settings.title} hideSettings />
      <div className="px-4 py-4">
        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface divide-y divide-hairline">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm text-ink-soft">{label}</span>
              <span className="text-sm text-ink text-right">{value || "—"}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-ink-faint">
          Full editing, logo upload, the rate card editor and the Excel export are coming soon.
        </p>

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
