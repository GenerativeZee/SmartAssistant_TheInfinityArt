"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { upsertService } from "@/lib/actions/services";
import { SERVICE_CATEGORIES, SERVICE_UNITS } from "@/lib/validation/services";
import { CATEGORY_LABEL, UNIT_LABEL } from "@/components/quotations/types";
import type { ServiceRow } from "./RateCardEditor";

export function ServiceEditSheet({
  open,
  onClose,
  service,
}: {
  open: boolean;
  onClose: () => void;
  service: ServiceRow | null;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={service ? "Edit service" : "Add service"} tall>
      {open && <ServiceForm service={service} onDone={onClose} />}
    </Sheet>
  );
}

function ServiceForm({ service, onDone }: { service: ServiceRow | null; onDone: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(service?.name ?? "");
  const [category, setCategory] = useState(service?.category ?? "signage");
  const [unit, setUnit] = useState(service?.unit ?? "sqft");
  const [rate, setRate] = useState(service ? String(service.default_rate) : "");
  const [gst, setGst] = useState(service ? String(service.gst_rate ?? 18) : "18");
  const [hsn, setHsn] = useState(service?.hsn_sac ?? "");
  const [active, setActive] = useState(service?.active ?? true);

  function save() {
    startTransition(async () => {
      const res = await upsertService({
        id: service?.id,
        name,
        category,
        unit,
        defaultRate: Number(rate) || 0,
        gstRate: Number(gst) || 0,
        hsnSac: hsn,
        active,
      });
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      toast("Saved");
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="block">
        <span className="text-sm text-ink-soft">Name</span>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Flex Printing" autoFocus />
      </label>

      <div>
        <span className="text-sm text-ink-soft">Category</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((c) => (
            <Chip key={c} size="sm" active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm text-ink-soft">Unit</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {SERVICE_UNITS.map((u) => (
            <Chip key={u} size="sm" active={unit === u} onClick={() => setUnit(u)}>
              {UNIT_LABEL[u]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <label className="block flex-1">
          <span className="text-sm text-ink-soft">Default rate</span>
          <div className="num mt-1 flex items-center rounded-[var(--radius-card)] border border-hairline bg-surface px-3 min-h-[var(--tap)]">
            <span className="text-ink-faint mr-1">₹</span>
            <input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0"
              className="w-full bg-transparent outline-none"
            />
          </div>
        </label>
        <label className="block w-24">
          <span className="text-sm text-ink-soft">GST %</span>
          <input
            inputMode="decimal"
            value={gst}
            onChange={(e) => setGst(e.target.value.replace(/[^\d.]/g, ""))}
            className="num mt-1 w-full min-h-[var(--tap)] rounded-[var(--radius-card)] border border-hairline bg-surface px-3 outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-ink-soft">HSN/SAC (optional)</span>
        <TextInput value={hsn} onChange={(e) => setHsn(e.target.value)} placeholder="e.g. 4911" />
      </label>

      <label className="flex items-center justify-between rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5">
        <span className="text-sm text-ink-soft">Active — shows in the rate card picker</span>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-5 w-5 accent-accent"
        />
      </label>

      <Button onClick={save} disabled={pending || !name} className="w-full">
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
