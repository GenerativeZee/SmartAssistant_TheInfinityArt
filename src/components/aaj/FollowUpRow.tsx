"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { completeFollowUp, snoozeFollowUp } from "@/lib/actions/followups";
import { telHref } from "@/lib/phone";
import { waLink } from "@/lib/messages";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";
import { IconPhone, IconChat, IconCheck } from "@/components/ui/icons";

export interface FollowUpRowData {
  id: string;
  clientId: string;
  clientName: string;
  phone: string | null;
  title: string;
  context: string | null;
  overdue: boolean;
}

export function FollowUpRow({ item }: { item: FollowUpRowData }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function done() {
    startTransition(async () => {
      const res = await completeFollowUp(item.id);
      if (res.ok) {
        toast(S.actions.done);
        router.refresh();
      }
    });
  }

  function snooze() {
    startTransition(async () => {
      const res = await snoozeFollowUp(item.id);
      if (res.ok) {
        toast(`${S.actions.snooze} · ${S.quickAdd.kal}`);
        router.refresh();
      }
    });
  }

  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-3 border-l-4",
        item.overdue ? "border-owed" : "border-transparent",
      )}
    >
      <Link href={`/clients/${item.clientId}`} className="min-w-0 flex-1">
        <p className="text-sm text-ink truncate">{item.clientName}</p>
        <p className="text-xs text-ink-faint truncate">
          {item.title}
          {item.context ? ` — ${item.context}` : ""}
        </p>
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        <a
          href={telHref(item.phone)}
          aria-label={S.actions.call}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
        >
          <IconPhone width={17} height={17} />
        </a>
        <a
          href={waLink(item.phone)}
          target="_blank"
          rel="noreferrer"
          aria-label={S.actions.whatsapp}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
        >
          <IconChat width={17} height={17} />
        </a>
        <button
          type="button"
          onClick={done}
          disabled={pending}
          aria-label={S.actions.done}
          className="grid h-9 w-9 place-items-center rounded-full text-run hover:bg-run-wash"
        >
          <IconCheck width={17} height={17} />
        </button>
        <button
          type="button"
          onClick={snooze}
          disabled={pending}
          className="h-9 px-2 rounded-full text-xs font-medium text-ink-soft hover:bg-surface-sunken"
        >
          {S.actions.kal}
        </button>
      </div>
    </li>
  );
}
