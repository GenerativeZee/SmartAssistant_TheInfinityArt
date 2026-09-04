"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StageStepper } from "./StageStepper";
import { AdvanceStageSheet } from "./AdvanceStageSheet";
import { DeliverySheet } from "./DeliverySheet";
import { CancelJobSheet } from "./CancelJobSheet";
import { AttachmentsBlock, type AttachmentItem } from "./AttachmentsBlock";
import { WaPreview } from "@/components/whatsapp/WaPreview";
import { PaymentSheet } from "@/components/paisa/PaymentSheet";
import { useToast } from "@/components/ui/Toast";
import { advanceJobStage, deliverJob, cancelJob } from "@/lib/actions/jobs";
import { formatMoney } from "@/lib/money";
import { fmtDay } from "@/lib/dates";
import { waLink, templates } from "@/lib/messages";
import { S } from "@/lib/strings";
import type { Stage } from "@/lib/validation/jobs";

interface JobDetailProps {
  job: {
    id: string;
    number: string | null;
    title: string;
    stage: Stage;
    promisedDate: string | null;
    notes: string | null;
  };
  client: { id: string; name: string; company: string | null; phone: string | null };
  shop: {
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    phone: string | null;
    email: string | null;
    gstin: string | null;
    upiId: string | null;
    builtByCredit: string | null;
    defaultGreeting: string;
  };
  financials: { total: number; received: number; balance: number };
  attachments: AttachmentItem[];
  isLate: boolean;
}

export function JobDetail({ job, client, shop, financials, attachments, isLate }: JobDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [advanceTarget, setAdvanceTarget] = useState<Stage | null>(null);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waMessage, setWaMessage] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);

  function onStepTap(stage: Stage) {
    if (stage === job.stage) return;
    if (stage === "delivered") setDeliveryOpen(true);
    else setAdvanceTarget(stage);
  }

  function confirmAdvance(note: string) {
    if (!advanceTarget) return;
    startTransition(async () => {
      const res = await advanceJobStage({ jobId: job.id, toStage: advanceTarget, note });
      setAdvanceTarget(null);
      if (res.ok) {
        toast(`Moved to ${S.stages[advanceTarget]}`);
        router.refresh();
      } else {
        toast(res.error, "err");
      }
    });
  }

  function confirmDelivery(input: { finalAmount: number; finalMode: "cash" | "upi" | "bank" | "cheque"; note: string }) {
    startTransition(async () => {
      const res = await deliverJob({ jobId: job.id, ...input });
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      setDeliveryOpen(false);
      toast("Marked delivered");
      const message = templates.delivery({
        name: client.name,
        greeting: shop.defaultGreeting,
        shopName: shop.name,
        reviewLink: "[add your Google review link here]",
      });
      setWaMessage(message);
      setWaOpen(true);
      router.refresh();
    });
  }

  function confirmCancel(note: string) {
    startTransition(async () => {
      const res = await cancelJob({ jobId: job.id, note });
      setCancelOpen(false);
      if (res.ok) {
        toast("Job cancelled");
        router.refresh();
      } else {
        toast(res.error, "err");
      }
    });
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-3">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/clients/${client.id}`} className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{client.name}</p>
            {client.company && <p className="text-xs text-ink-faint truncate">{client.company}</p>}
          </Link>
          {job.number && <p className="num text-xs text-ink-faint shrink-0">{job.number}</p>}
        </div>
        <p className="text-sm text-ink mt-2">{job.title}</p>
        {job.promisedDate && (
          <p className="text-xs mt-1">
            <span className="text-ink-faint">Promised </span>
            <span className={`num font-medium ${isLate ? "text-owed" : "text-ink"}`}>
              {fmtDay(job.promisedDate)}
              {isLate ? ` · ${S.aaj.late}` : ""}
            </span>
          </p>
        )}
      </div>

      <StageStepper stage={job.stage} onTap={onStepTap} disabled={pending} />

      {job.stage !== "cancelled" && job.stage !== "delivered" && (
        <button
          type="button"
          onClick={() => setDeliveryOpen(true)}
          className="min-h-[var(--tap)] rounded-[var(--radius-card)] bg-accent text-accent-ink font-medium"
        >
          {S.job.deliver}
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Stat label={S.job.total} value={financials.total} />
        <Stat label={S.job.received} value={financials.received} />
        <Stat label={S.job.balance} value={financials.balance} tone={financials.balance > 0 ? "owed" : undefined} />
      </div>

      {financials.balance > 0 && (
        <button
          type="button"
          onClick={() => setPaymentOpen(true)}
          className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface text-ink font-medium"
        >
          {S.paisa.addPayment}
        </button>
      )}

      <AttachmentsBlock jobId={job.id} items={attachments} />

      {client.phone && (
        <a
          href={waLink(client.phone)}
          target="_blank"
          rel="noreferrer"
          className="text-center text-sm text-accent font-medium"
        >
          {S.actions.whatsapp} {client.name}
        </a>
      )}

      {job.stage !== "cancelled" && job.stage !== "delivered" && (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className="text-center text-xs text-ink-faint underline"
        >
          Cancel job
        </button>
      )}

      <AdvanceStageSheet
        open={advanceTarget !== null}
        onClose={() => setAdvanceTarget(null)}
        toStage={advanceTarget}
        pending={pending}
        onConfirm={confirmAdvance}
      />
      <DeliverySheet
        open={deliveryOpen}
        onClose={() => setDeliveryOpen(false)}
        balance={financials.balance}
        pending={pending}
        onConfirm={confirmDelivery}
      />
      <CancelJobSheet open={cancelOpen} onClose={() => setCancelOpen(false)} pending={pending} onConfirm={confirmCancel} />
      <WaPreview open={waOpen} onClose={() => setWaOpen(false)} phone={client.phone} message={waMessage} />

      <PaymentSheet
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        shop={shop}
        presetClient={{ id: client.id, name: client.name, company: client.company, phone: client.phone }}
        presetJob={{ id: job.id, number: job.number, title: job.title, balance: financials.balance }}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "owed" }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-2.5">
      <p className="text-[10px] text-ink-faint uppercase tracking-wide">{label}</p>
      <p className={`num text-sm font-semibold mt-0.5 ${tone === "owed" ? "text-owed" : "text-ink"}`}>
        {formatMoney(value)}
      </p>
    </div>
  );
}
