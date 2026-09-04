import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";

export const metadata = { title: S.tabs.clients };

export default async function ClientsPage() {
  const supabase = await createClient();
  const { count } = await supabase.from("clients").select("id", { count: "exact", head: true });

  return (
    <>
      <ScreenHeader title={S.tabs.clients} subtitle={`${count ?? 0} clients`} />
      <Placeholder milestone="M2" note="Client list, search aur poori kahani timeline yahan aayegi." />
    </>
  );
}
