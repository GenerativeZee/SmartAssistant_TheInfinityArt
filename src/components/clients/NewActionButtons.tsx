"use client";

import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { S } from "@/lib/strings";

export function NewActionButtons({ clientId }: { clientId: string }) {
  const toast = useToast();
  return (
    <div className="grid grid-cols-2 gap-2 px-4 mt-3">
      <Link
        href={`/quotations/new?client=${clientId}`}
        className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface text-ink font-medium inline-flex items-center justify-center"
      >
        {S.client.newQuotation}
      </Link>
      <button
        type="button"
        onClick={() => toast("Job creation is coming soon")}
        className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface text-ink font-medium"
      >
        {S.client.newJob}
      </button>
    </div>
  );
}
