import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";

export const metadata = { title: S.tabs.jobs };

export default async function JobsPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .not("stage", "in", "(delivered,cancelled)");

  return (
    <>
      <ScreenHeader title={S.job.board} subtitle={`${count ?? 0} chal rahe hain`} />
      <Placeholder milestone="M4" note="Late · Aaj · Is hafte · Baad mein — job board yahan aayega." />
    </>
  );
}
