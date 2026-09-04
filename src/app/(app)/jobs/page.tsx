import Link from "next/link";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { createClient } from "@/lib/supabase/server";
import { todayIST, addDaysIST, fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";

export const metadata = { title: S.job.board };

type Row = {
  id: string;
  number: string | null;
  title: string;
  stage: string;
  promised_date: string | null;
  clients: { name: string } | null;
};

export default async function JobsPage() {
  const supabase = await createClient();
  const today = todayIST();

  const { data } = await supabase
    .from("jobs")
    .select("id, number, title, stage, promised_date, clients(name)")
    .not("stage", "in", "(delivered,cancelled)")
    .order("promised_date", { ascending: true, nullsFirst: false });

  const rows = (data ?? []) as unknown as Row[];

  const weekEnd = addDaysIST(today, 7);
  const groups = {
    late: rows.filter((j) => j.promised_date && j.promised_date < today),
    today: rows.filter((j) => j.promised_date === today),
    week: rows.filter((j) => j.promised_date && j.promised_date > today && j.promised_date <= weekEnd),
    later: rows.filter((j) => !j.promised_date || j.promised_date > weekEnd),
  };

  return (
    <>
      <ScreenHeader title={S.job.board} subtitle={`${rows.length} in progress`} />
      <div className="px-4 py-3">
        {rows.length === 0 && <p className="text-sm text-ink-soft text-center py-16">{S.common.empty}</p>}

        <JobGroup title={S.job.groupLate} jobs={groups.late} today={today} />
        <JobGroup title={S.job.groupToday} jobs={groups.today} today={today} />
        <JobGroup title={S.job.groupWeek} jobs={groups.week} today={today} />
        <JobGroup title={S.job.groupLater} jobs={groups.later} today={today} />
      </div>
    </>
  );
}

function JobGroup({ title, jobs, today }: { title: string; jobs: Row[]; today: string }) {
  if (jobs.length === 0) return null;
  return (
    <div className="mb-5">
      <h2 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">
        <span>{title}</span>
        <span className="num">{jobs.length}</span>
      </h2>
      <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
        {jobs.map((j) => {
          const late = !!j.promised_date && j.promised_date < today;
          const soon = !!j.promised_date && !late && j.promised_date <= (addDaysIST(today, 2));
          return (
            <li key={j.id}>
              <Link
                href={`/jobs/${j.id}`}
                className={cn("flex items-center justify-between gap-3 px-3 py-3 border-l-4", late ? "border-owed" : soon ? "border-risk" : "border-transparent")}
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{j.clients?.name ?? "—"}</p>
                  <p className="text-xs text-ink-faint truncate">
                    {j.title} · {S.stages[j.stage as keyof typeof S.stages] ?? j.stage}
                  </p>
                </div>
                <span className={cn("num text-xs font-semibold shrink-0", late ? "text-owed" : "text-ink-soft")}>
                  {late ? S.aaj.late : j.promised_date ? fmtDay(j.promised_date) : "—"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
