"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { computeQuoteTotals, computeLine, type SqftRounding } from "@/lib/pricing";
import { parseAmount } from "@/lib/money";
import { S } from "@/lib/strings";
import { templates } from "@/lib/messages";
import { fmtDay } from "@/lib/dates";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { WaPreview } from "@/components/whatsapp/WaPreview";
import { WonSheet } from "@/components/jobs/WonSheet";
import { createQuotation, updateQuotation, setQuotationPdfUrl, markQuotationSent, markQuotationLost } from "@/lib/actions/quotations";
import { markQuotationWon } from "@/lib/actions/jobs";
import type { Stage } from "@/lib/validation/jobs";
import { ItemRow } from "./ItemRow";
import { ServicePickerSheet } from "./ServicePickerSheet";
import { TotalsBar } from "./TotalsBar";
import { newLineKey, type BuilderLine, type ServiceOption } from "./types";
import type { MessageTemplateOverrides } from "@/lib/messages";

interface ShopInfo {
  name: string;
  legalName: string | null;
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
  sqftRounding: SqftRounding;
  messageTemplates?: MessageTemplateOverrides;
}

interface ClientInfo {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  address: string | null;
}

const LOST_REASONS: { value: string; label: string }[] = [
  { value: "price", label: "Price" },
  { value: "timeline", label: "Timeline" },
  { value: "no_response", label: "No response" },
  { value: "went_elsewhere", label: "Went elsewhere" },
  { value: "cancelled_project", label: "Project cancelled" },
  { value: "other", label: "Other" },
];

export function QuotationBuilder({
  shop,
  client,
  services,
  quotationId: initialId,
  quotationNumber: initialNumber,
  status,
  sentAt,
  today,
  initialLines,
  initialDiscount = 0,
  initialNotes = "",
  initialTerms = "",
}: {
  shop: ShopInfo;
  client: ClientInfo;
  services: ServiceOption[];
  quotationId?: string;
  quotationNumber?: string;
  status?: string;
  sentAt?: string | null;
  today: string;
  initialLines: BuilderLine[];
  initialDiscount?: number;
  initialNotes?: string;
  initialTerms?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [id, setId] = useState(initialId);
  const [number, setNumber] = useState(initialNumber);
  const [lines, setLines] = useState<BuilderLine[]>(initialLines);
  const [discount, setDiscount] = useState(initialDiscount);
  const [notes, setNotes] = useState(initialNotes);
  const [terms, setTerms] = useState(initialTerms);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [wonOpen, setWonOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waMessage, setWaMessage] = useState("");
  const [busyAction, setBusyAction] = useState<"draft" | "preview" | "whatsapp" | null>(null);

  const totals = useMemo(
    () => computeQuoteTotals({ lines, discount }, shop.sqftRounding),
    [lines, discount, shop.sqftRounding],
  );

  const readOnly = status === "won" || status === "lost";

  function addFromService(service: ServiceOption) {
    setLines((ls) => [
      ...ls,
      {
        key: newLineKey(),
        serviceId: service.id,
        description: service.name,
        unit: service.unit,
        qty: 1,
        widthFt: null,
        heightFt: null,
        rate: Number(service.default_rate),
        gstRate: Number(service.gst_rate ?? 18),
      },
    ]);
  }

  function addCustom() {
    setLines((ls) => [
      ...ls,
      {
        key: newLineKey(),
        serviceId: null,
        description: "",
        unit: "piece",
        qty: 1,
        widthFt: null,
        heightFt: null,
        rate: 0,
        gstRate: 18,
      },
    ]);
  }

  function updateLine(key: string, patch: Partial<BuilderLine>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }

  function buildPayload() {
    return {
      clientId: client.id,
      items: lines.map((l) => ({
        serviceId: l.serviceId,
        description: l.description || "Item",
        unit: l.unit,
        qty: l.qty || 1,
        widthFt: l.widthFt,
        heightFt: l.heightFt,
        rate: l.rate || 0,
        gstRate: l.gstRate || 0,
      })),
      discount,
      notes,
      terms,
    };
  }

  /** Save current state (create the first time, update after) and return the id. */
  async function persist(): Promise<string | null> {
    if (lines.length === 0) {
      toast("Add at least one item first", "err");
      return null;
    }
    const payload = buildPayload();
    if (!id) {
      const res = await createQuotation(payload);
      if (!res.ok) {
        toast(res.error, "err");
        return null;
      }
      setId(res.id);
      setNumber(res.number);
      return res.id;
    }
    const res = await updateQuotation(id, payload);
    if (!res.ok) {
      toast(res.error, "err");
      return null;
    }
    return id;
  }

  function handleSaveDraft() {
    setBusyAction("draft");
    startTransition(async () => {
      const savedId = await persist();
      setBusyAction(null);
      if (!savedId) return;
      toast(S.common.saved);
      if (!initialId) router.replace(`/quotations/${savedId}`);
      else router.refresh();
    });
  }

  async function buildPdfElement(quotationNumber: string) {
    const { QuotationPdf } = await import("@/components/pdf/QuotationPdf");
    return (
      <QuotationPdf
        shop={{
          name: shop.name,
          legalName: shop.legalName,
          address: shop.address,
          city: shop.city,
          state: shop.state,
          pincode: shop.pincode,
          phone: shop.phone,
          email: shop.email,
          gstin: shop.gstin,
          upiId: shop.upiId,
          builtByCredit: shop.builtByCredit,
        }}
        client={client}
        quotation={{
          number: quotationNumber,
          quoteDate: new Date().toISOString(),
          validUntil: null,
          notes,
          terms,
        }}
        items={lines.map((l) => {
          const computed = computeLine(l, shop.sqftRounding);
          return {
            description: l.description,
            unit: l.unit,
            qty: l.qty,
            widthFt: l.widthFt,
            heightFt: l.heightFt,
            area: computed.area,
            rate: l.rate,
            gstRate: l.gstRate,
            amount: computed.amount,
          };
        })}
        totals={totals}
      />
    );
  }

  function handlePreview() {
    setBusyAction("preview");
    startTransition(async () => {
      const savedId = await persist();
      if (!savedId || !number) {
        setBusyAction(null);
        return;
      }
      try {
        const { renderPdfBlob } = await import("@/lib/share-pdf");
        const doc = await buildPdfElement(number);
        const blob = await renderPdfBlob(doc);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        toast("Could not build the PDF", "err");
      }
      setBusyAction(null);
    });
  }

  function handleWhatsapp() {
    setBusyAction("whatsapp");
    startTransition(async () => {
      const savedId = await persist();
      if (!savedId || !number) {
        setBusyAction(null);
        return;
      }
      try {
        const { sharePdf } = await import("@/lib/share-pdf");
        const doc = await buildPdfElement(number);
        const path = `${savedId}.pdf`;
        const url = await sharePdf(doc, "pdfs", path);
        await setQuotationPdfUrl(savedId, url);

        const message = templates.quotation(
          {
            name: client.name,
            greeting: shop.defaultGreeting,
            shopName: shop.name,
            requirement: lines[0]?.description ?? "your order",
            total: totals.total,
            link: url,
          },
          shop.messageTemplates?.quotation,
        );
        setWaMessage(message);
        setWaOpen(true);
      } catch {
        toast("Could not build the PDF", "err");
      }
      setBusyAction(null);
    });
  }

  function handleWaSent() {
    if (!id) return;
    startTransition(async () => {
      const res = await markQuotationSent(id);
      if (res.ok) {
        toast("Marked as sent");
        router.refresh();
      }
    });
  }

  function handleMarkWon(input: { promisedDate: string; startingStage: Stage; advanceAmount: number; advanceMode: "cash" | "upi" | "bank" | "cheque" }) {
    if (!id) return;
    startTransition(async () => {
      const res = await markQuotationWon({ quotationId: id, ...input });
      if (res.ok) {
        setWonOpen(false);
        toast("Job created");
        router.push(`/jobs/${res.jobId}`);
      } else {
        toast(res.error, "err");
      }
    });
  }

  function handleLost(reason: string, note: string) {
    if (!id) return;
    startTransition(async () => {
      const res = await markQuotationLost({ id, reason, note });
      setLostOpen(false);
      if (res.ok) {
        toast("Marked as lost");
        router.refresh();
      } else {
        toast(res.error, "err");
      }
    });
  }

  return (
    <div className="pb-40">
      <div className="px-4 pt-3">
        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{client.name}</p>
            {client.company && <p className="text-xs text-ink-faint">{client.company}</p>}
          </div>
          {number && <p className="num text-xs text-ink-faint">{number}</p>}
        </div>

        {status && status !== "draft" && (
          <div className="mt-2 flex items-center gap-2">
            <StatusPill status={status} />
            {status === "sent" && sentAt && (
              <span className="text-xs text-ink-faint">
                sent {fmtDay(sentAt)}
                {isOverThreeDays(sentAt) ? " · follow up" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {lines.map((line) => (
          <ItemRow
            key={line.key}
            line={line}
            rounding={shop.sqftRounding}
            onChange={(patch) => updateLine(line.key, patch)}
            onRemove={() => removeLine(line.key)}
          />
        ))}

        {!readOnly && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-dashed border-hairline text-sm text-accent font-medium"
          >
            + {S.quotation.addItem}
          </button>
        )}

        <label className="mt-2 flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5">
          <span className="text-sm text-ink-soft">{S.quotation.discount}</span>
          <input
            inputMode="decimal"
            value={discount || ""}
            onChange={(e) => setDiscount(parseAmount(e.target.value))}
            placeholder="0"
            className="num w-28 text-right bg-transparent outline-none text-sm"
          />
        </label>

        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder={S.quotation.title + " terms"}
          rows={3}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent resize-none"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent resize-none"
        />

        {!readOnly && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button variant="surface" onClick={handleSaveDraft} disabled={pending}>
              {busyAction === "draft" ? S.common.loading : S.actions.saveDraft}
            </Button>
            <Button variant="surface" onClick={handlePreview} disabled={pending}>
              {busyAction === "preview" ? S.common.loading : S.actions.preview}
            </Button>
            <Button onClick={handleWhatsapp} disabled={pending} className="col-span-2">
              {busyAction === "whatsapp" ? S.common.loading : S.actions.whatsapp}
            </Button>
            {id && (status === "sent" || status === "followup") && (
              <>
                <Button variant="surface" onClick={() => setWonOpen(true)} className="col-span-2 text-run">
                  {S.quotation.markWon}
                </Button>
                <button
                  type="button"
                  onClick={() => setLostOpen(true)}
                  className="col-span-2 text-center text-xs text-ink-faint underline mt-1"
                >
                  {S.quotation.markLost}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <TotalsBar totals={totals} />

      <ServicePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        services={services}
        onPick={addFromService}
        onCustom={addCustom}
      />

      <WaPreview
        open={waOpen}
        onClose={() => setWaOpen(false)}
        phone={client.phone}
        message={waMessage}
        onSent={handleWaSent}
      />

      <LostSheet open={lostOpen} onClose={() => setLostOpen(false)} onConfirm={handleLost} />

      <WonSheet
        open={wonOpen}
        onClose={() => setWonOpen(false)}
        today={today}
        pending={pending}
        onConfirm={handleMarkWon}
      />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = S.quotation[`status${cap(status)}` as keyof typeof S.quotation] ?? status;
  const tone =
    status === "won" ? "text-run bg-run-wash" : status === "lost" ? "text-owed bg-owed-wash" : "text-accent bg-accent-wash";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tone}`}>{label as string}</span>;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isOverThreeDays(sentAt: string): boolean {
  return Date.now() - new Date(sentAt).getTime() > 3 * 24 * 60 * 60 * 1000;
}

function LostSheet({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, note: string) => void;
}) {
  const [reason, setReason] = useState("price");
  const [note, setNote] = useState("");
  return (
    <Sheet open={open} onClose={onClose} title={S.quotation.markLost}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {LOST_REASONS.map((r) => (
            <Chip key={r.value} active={reason === r.value} onClick={() => setReason(r.value)}>
              {r.label}
            </Chip>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          rows={2}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent resize-none"
        />
        <Button variant="danger" onClick={() => onConfirm(reason, note)} className="w-full">
          {S.quotation.markLost}
        </Button>
      </div>
    </Sheet>
  );
}
