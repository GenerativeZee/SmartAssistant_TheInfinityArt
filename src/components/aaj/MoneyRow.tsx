import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { telHref } from "@/lib/phone";
import { waLink } from "@/lib/messages";
import { ageingLabel, ageingTone } from "@/lib/ageing";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";
import { IconPhone, IconChat } from "@/components/ui/icons";

const TONE_CLASS: Record<"risk" | "owed" | "faint", string> = {
  risk: "bg-risk-wash text-risk",
  owed: "bg-owed-wash text-owed",
  faint: "bg-surface-sunken text-ink-faint",
};

export function MoneyRow({
  clientId,
  clientName,
  phone,
  balance,
  daysOutstanding,
}: {
  clientId: string;
  clientName: string;
  phone: string | null;
  balance: number;
  daysOutstanding: number | null;
}) {
  return (
    <li className="flex items-center gap-2 px-3 py-3">
      <Link href={`/clients/${clientId}`} className="min-w-0 flex-1">
        <p className="text-sm text-ink truncate">{clientName}</p>
        <span
          className={cn(
            "inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
            TONE_CLASS[ageingTone(daysOutstanding)],
          )}
        >
          {ageingLabel(daysOutstanding)}
        </span>
      </Link>
      <span className="num text-sm font-semibold text-owed shrink-0">{formatMoney(balance)}</span>
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
