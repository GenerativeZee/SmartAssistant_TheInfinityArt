import Link from "next/link";
import { telHref } from "@/lib/phone";
import { waLink } from "@/lib/messages";
import { fmtDay } from "@/lib/dates";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";
import { IconPhone, IconChat } from "@/components/ui/icons";

export function DeliveryRow({
  jobId,
  clientName,
  phone,
  title,
  promisedDate,
  late,
}: {
  jobId: string;
  clientName: string;
  phone: string | null;
  title: string;
  promisedDate: string;
  late: boolean;
}) {
  return (
    <li className={cn("flex items-center gap-2 px-3 py-3 border-l-4", late ? "border-owed" : "border-transparent")}>
      <Link href={`/jobs/${jobId}`} className="min-w-0 flex-1">
        <p className="text-sm text-ink truncate">{clientName}</p>
        <p className="text-xs text-ink-faint truncate">{title}</p>
      </Link>
      <span className={cn("num text-xs font-semibold shrink-0", late ? "text-owed" : "text-ink-soft")}>
        {late ? S.aaj.late : fmtDay(promisedDate)}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <a
          href={telHref(phone)}
          aria-label={S.actions.call}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
        >
          <IconPhone width={17} height={17} />
        </a>
        <a
          href={waLink(phone)}
          target="_blank"
          rel="noreferrer"
          aria-label={S.actions.whatsapp}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
        >
          <IconChat width={17} height={17} />
        </a>
      </div>
    </li>
  );
}
