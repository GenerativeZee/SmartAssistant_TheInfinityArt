import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";
import { todayIST, fmtDay } from "@/lib/dates";

export const metadata = { title: S.aaj.title };

export default async function AajPage() {
  const supabase = await createClient();
  const { data: shop } = await supabase.from("shops").select("name").single();

  return (
    <>
      <ScreenHeader title={S.aaj.title} subtitle={`${shop?.name ?? S.appName} · ${fmtDay(todayIST())}`} />
      <Placeholder milestone="M6" note="Call karna hai · Paisa baaki · Aaj/kal delivery — yahan aayega." />
    </>
  );
}
