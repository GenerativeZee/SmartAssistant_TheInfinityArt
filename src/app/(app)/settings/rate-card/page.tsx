import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { RateCardEditor } from "@/components/settings/RateCardEditor";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";

export const metadata = { title: S.settings.rateCard };

export default async function RateCardPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, category, unit, default_rate, gst_rate, hsn_sac, active")
    .order("sort_order");

  return (
    <>
      <ScreenHeader title={S.settings.rateCard} backHref="/settings" />
      <div className="px-4 py-4">
        <RateCardEditor
          services={(services ?? []).map((s) => ({ ...s, default_rate: Number(s.default_rate) }))}
        />
      </div>
    </>
  );
}
