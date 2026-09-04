"use client";

import { computeLine, type SqftRounding } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import type { BuilderLine } from "./types";

/** One editable quotation line. Size inputs + live area only show for sq.ft units (§6.2). */
export function ItemRow({
  line,
  rounding,
  onChange,
  onRemove,
}: {
  line: BuilderLine;
  rounding: SqftRounding;
  onChange: (patch: Partial<BuilderLine>) => void;
  onRemove: () => void;
}) {
  const computed = computeLine(
    { unit: line.unit, qty: line.qty, widthFt: line.widthFt, heightFt: line.heightFt, rate: line.rate, gstRate: line.gstRate },
    rounding,
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-3">
      <div className="flex items-start gap-2">
        <input
          value={line.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Item description"
          className="flex-1 min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint font-medium"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove item"
          className="shrink-0 h-7 w-7 grid place-items-center rounded-full text-ink-faint hover:bg-surface-sunken hover:text-owed"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {line.unit === "sqft" && (
        <div className="mt-2 flex items-center gap-2">
          <NumField
            value={line.widthFt ?? ""}
            onChange={(v) => onChange({ widthFt: v })}
            placeholder="W"
            suffix="ft"
            className="w-20"
          />
          <span className="text-ink-faint">×</span>
          <NumField
            value={line.heightFt ?? ""}
            onChange={(v) => onChange({ heightFt: v })}
            placeholder="H"
            suffix="ft"
            className="w-20"
          />
          {computed.areaLabel && (
            <span className="num text-xs text-ink-soft ml-1">{computed.areaLabel}</span>
          )}
        </div>
      )}

      <div className="mt-2.5 flex items-end gap-3">
        <Labeled label="Qty">
          <NumField value={line.qty} onChange={(v) => onChange({ qty: v ?? 1 })} className="w-16" />
        </Labeled>
        <Labeled label="Rate">
          <NumField value={line.rate} onChange={(v) => onChange({ rate: v ?? 0 })} prefix="₹" className="w-24" />
        </Labeled>
        <Labeled label="GST %">
          <NumField value={line.gstRate} onChange={(v) => onChange({ gstRate: v ?? 0 })} className="w-16" />
        </Labeled>
        <div className="ml-auto text-right">
          <p className="text-[10px] text-ink-faint uppercase tracking-wide">Amount</p>
          <p className="num text-sm font-semibold text-ink">{formatMoney(computed.amount)}</p>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] text-ink-faint uppercase tracking-wide mb-0.5">{label}</span>
      {children}
    </label>
  );
}

function NumField({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  className,
}: {
  value: number | "";
  onChange: (v: number | null) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={`num flex items-center rounded-[10px] border border-hairline bg-surface-sunken px-2 py-1.5 text-sm ${className ?? ""}`}>
      {prefix && <span className="text-ink-faint mr-0.5">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full bg-transparent outline-none"
      />
      {suffix && <span className="text-ink-faint ml-0.5">{suffix}</span>}
    </div>
  );
}
