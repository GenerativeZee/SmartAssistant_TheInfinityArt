import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { JobDetail } from "@/components/jobs/JobDetail";
import { createClient } from "@/lib/supabase/server";
import { todayIST } from "@/lib/dates";
import { S } from "@/lib/strings";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!job) notFound();

  const [{ data: client }, { data: shop }, { data: financials }, { data: attachments }] = await Promise.all([
    supabase.from("clients").select("id, name, company, phone").eq("id", job.client_id).single(),
    supabase.from("shops").select("default_greeting, name").single(),
    supabase.from("job_financials").select("*").eq("job_id", id).maybeSingle(),
    supabase
      .from("attachments")
      .select("id, url, filename, kind")
      .eq("entity_type", "job")
      .eq("entity_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!client || !shop) notFound();

  const today = todayIST();
  const isLate = !!job.promised_date && job.promised_date < today && job.stage !== "delivered" && job.stage !== "cancelled";

  return (
    <>
      <ScreenHeader title={job.number ?? S.job.title} backHref="/jobs" />
      <JobDetail
        job={{
          id: job.id,
          number: job.number,
          title: job.title,
          stage: job.stage,
          promisedDate: job.promised_date,
          notes: job.notes,
        }}
        client={client}
        shop={{ defaultGreeting: shop.default_greeting, name: shop.name }}
        financials={{
          total: Number(financials?.total_amount ?? job.total_amount),
          received: Number(financials?.received ?? 0),
          balance: Number(financials?.balance ?? job.total_amount),
        }}
        attachments={attachments ?? []}
        isLate={isLate}
      />
    </>
  );
}
