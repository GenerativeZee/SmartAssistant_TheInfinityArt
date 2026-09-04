"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { WaPreview } from "@/components/whatsapp/WaPreview";
import { useToast } from "@/components/ui/Toast";
import { formatMoney } from "@/lib/money";
import { todayIST } from "@/lib/dates";
import { templates, type MessageTemplateOverrides } from "@/lib/messages";
import { S } from "@/lib/strings";
import {
  recordPayment,
  setPaymentPdfUrl,
  searchClientsBrief,
  getClientJobsForPayment,
} from "@/lib/actions/payments";

const MODES = ["cash", "upi", "bank", "cheque"] as const;

interface ClientOpt {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
}
interface JobOpt {
  id: string;
  number: string | null;
  title: string;
  balance: number;
}
interface ShopInfo {
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
  messageTemplates?: MessageTemplateOverrides;
}

/**
 * Every fresh open remounts PaymentSheetBody (Sheet unmounts its children
 * when closed), so its useState initialisers always start clean — no
 * "reset state from a prop" effect needed. waOpen/waMessage live up here
 * because the receipt preview must survive after this sheet closes.
 */
export function PaymentSheet({
  open,
  onClose,
  shop,
  presetClient,
  presetJob,
}: {
  open: boolean;
  onClose: () => void;
  shop: ShopInfo;
  presetClient?: ClientOpt;
  presetJob?: JobOpt | null;
}) {
  const [waOpen, setWaOpen] = useState(false);
  const [waMessage, setWaMessage] = useState("");
  const [waPhone, setWaPhone] = useState<string | null>(null);

  return (
    <>
      <Sheet open={open} onClose={onClose} title={S.paisa.addPayment} tall>
        {open && (
          <PaymentSheetBody
            shop={shop}
            presetClient={presetClient}
            presetJob={presetJob}
            onClose={onClose}
            onReceiptReady={(message, phone) => {
              setWaMessage(message);
              setWaPhone(phone);
              setWaOpen(true);
            }}
          />
        )}
      </Sheet>

      <WaPreview open={waOpen} onClose={() => setWaOpen(false)} phone={waPhone} message={waMessage} />
    </>
  );
}

function PaymentSheetBody({
  shop,
  presetClient,
  presetJob,
  onClose,
  onReceiptReady,
}: {
  shop: ShopInfo;
  presetClient?: ClientOpt;
  presetJob?: JobOpt | null;
  onClose: () => void;
  onReceiptReady: (message: string, phone: string | null) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<"client" | "job" | "details">(
    presetClient ? (presetJob !== undefined ? "details" : "job") : "client",
  );
  const [client, setClient] = useState<ClientOpt | undefined>(presetClient);
  const [job, setJob] = useState<JobOpt | null | undefined>(presetJob);
  const [jobOptions, setJobOptions] = useState<JobOpt[]>([]);

  const [amount, setAmount] = useState(presetJob && presetJob.balance > 0 ? String(presetJob.balance) : "");
  const [mode, setMode] = useState<(typeof MODES)[number]>("cash");
  const [date, setDate] = useState(todayIST());
  const [note, setNote] = useState("");

  async function pickClient(c: ClientOpt) {
    setClient(c);
    const jobs = await getClientJobsForPayment(c.id);
    setJobOptions(jobs);
    setStep("job");
  }

  function pickJob(j: JobOpt | null) {
    setJob(j);
    setAmount(j && j.balance > 0 ? String(j.balance) : "");
    setStep("details");
  }

  function save() {
    if (!client) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast("Enter an amount", "err");
      return;
    }
    startTransition(async () => {
      const res = await recordPayment({
        clientId: client.id,
        jobId: job?.id ?? null,
        amount: amt,
        mode,
        receivedAt: date,
        note,
      });
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      toast(`Saved · ${res.receiptNumber}`);

      try {
        const { ReceiptPdf } = await import("@/components/pdf/ReceiptPdf");
        const { sharePdf } = await import("@/lib/share-pdf");
        const balanceAfter = job ? Math.max(0, job.balance - amt) : 0;
        const doc = (
          <ReceiptPdf
            shop={shop}
            client={client}
            receipt={{
              number: res.receiptNumber,
              receivedAt: date,
              mode,
              jobLabel: job ? job.number ?? job.title : null,
            }}
            amount={amt}
            balanceAfter={balanceAfter}
          />
        );
        const url = await sharePdf(doc, "pdfs", `${res.paymentId}.pdf`);
        await setPaymentPdfUrl(res.paymentId, url);

        const message = templates.receipt(
          {
            name: client.name,
            greeting: shop.defaultGreeting,
            shopName: shop.name,
            amount: amt,
            balance: balanceAfter,
            link: url,
          },
          shop.messageTemplates?.receipt,
        );
        onClose();
        onReceiptReady(message, client.phone);
      } catch {
        onClose();
      }
      router.refresh();
    });
  }

  if (step === "client") return <ClientStep onPick={pickClient} />;
  if (step === "job" && client) {
    return <JobStep client={client} jobs={jobOptions} onPick={pickJob} onBack={() => setStep("client")} />;
  }
  if (step !== "details" || !client) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5">
        <p className="text-sm text-ink font-medium">{client.name}</p>
        <p className="text-xs text-ink-faint">{job ? job.number ?? job.title : "General payment"}</p>
      </div>

      <label className="block">
        <span className="text-sm text-ink-soft">{S.paisa.amount}</span>
        <div className="num mt-1 flex items-center rounded-[var(--radius-card)] border border-hairline bg-surface px-3 min-h-[var(--tap)]">
          <span className="text-ink-faint mr-1">₹</span>
          <input
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="0"
            className="w-full bg-transparent outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-sm text-ink-soft">{S.paisa.mode}</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as (typeof MODES)[number])}
          className="mt-1 w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 text-sm text-ink outline-none"
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {S.modes[m]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-ink-soft">{S.paisa.date}</span>
        <input
          type="date"
          max={todayIST()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="num mt-1 w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 text-ink outline-none"
        />
      </label>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        rows={2}
        className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent resize-none"
      />

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? S.common.loading : S.actions.save}
      </Button>
    </div>
  );
}

function ClientStep({ onPick }: { onPick: (c: ClientOpt) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ClientOpt[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(v: string) {
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setResults(await searchClientsBrief(v));
    }, 200);
  }

  return (
    <div className="flex flex-col gap-3">
      <TextInput
        autoFocus
        placeholder="Search by name or phone"
        value={q}
        onChange={(e) => onChange(e.target.value)}
      />
      <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden">
        {results.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c)}
              className="w-full text-left px-3 py-3 bg-surface active:bg-surface-sunken"
            >
              <p className="text-sm text-ink">{c.name}</p>
              {c.company && <p className="text-xs text-ink-faint">{c.company}</p>}
            </button>
          </li>
        ))}
        {q && results.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-ink-faint">{S.common.empty}</li>
        )}
      </ul>
    </div>
  );
}

function JobStep({
  client,
  jobs,
  onPick,
  onBack,
}: {
  client: ClientOpt;
  jobs: JobOpt[];
  onPick: (j: JobOpt | null) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{S.paisa.againstJob}</p>
        <button type="button" onClick={onBack} className="text-xs text-accent">
          Change client
        </button>
      </div>
      <p className="text-sm font-medium text-ink -mt-2">{client.name}</p>
      <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden">
        <li>
          <button
            type="button"
            onClick={() => onPick(null)}
            className="w-full text-left px-3 py-3 bg-surface active:bg-surface-sunken"
          >
            <p className="text-sm text-ink">General payment</p>
            <p className="text-xs text-ink-faint">Not tied to a specific job</p>
          </button>
        </li>
        {jobs.map((j) => (
          <li key={j.id}>
            <button
              type="button"
              onClick={() => onPick(j)}
              className="w-full flex items-center justify-between gap-3 px-3 py-3 bg-surface active:bg-surface-sunken"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{j.title}</p>
                <p className="num text-xs text-ink-faint">{j.number}</p>
              </div>
              <span className="num text-sm font-semibold text-ink shrink-0">{formatMoney(j.balance)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
