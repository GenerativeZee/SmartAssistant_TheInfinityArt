"use client";

import { useState } from "react";
import { ServiceEditSheet } from "./ServiceEditSheet";
import { formatMoney } from "@/lib/money";
import { CATEGORY_LABEL, UNIT_LABEL } from "@/components/quotations/types";
import { cn } from "@/lib/cn";

export interface ServiceRow {
  id: string;
  name: string;
  category: string;
  unit: "sqft" | "piece" | "box" | "job" | "hour";
  default_rate: number;
  gst_rate: number | null;
  hsn_sac: string | null;
  active: boolean;
}

export function RateCardEditor({ services }: { services: ServiceRow[] }) {
  const [editing, setEditing] = useState<ServiceRow | null | undefined>(undefined);

  const groups = services.reduce<Record<string, ServiceRow[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => setEditing(null)}
        className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-dashed border-hairline text-sm text-accent font-medium"
      >
        + Add service
      </button>

      {Object.entries(groups).map(([category, list]) => (
        <div key={category}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">
            {CATEGORY_LABEL[category] ?? category}
          </h2>
          <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden bg-surface">
            {list.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setEditing(s)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-3 text-left",
                    !s.active && "opacity-50",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">
                      {s.name}
                      {!s.active && <span className="text-xs text-ink-faint"> · inactive</span>}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {UNIT_LABEL[s.unit]} · GST {s.gst_rate ?? 0}%{s.hsn_sac ? ` · ${s.hsn_sac}` : ""}
                    </p>
                  </div>
                  <span className="num text-sm font-semibold text-ink shrink-0">{formatMoney(s.default_rate)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {services.length === 0 && <p className="text-sm text-ink-soft text-center py-10">No services yet.</p>}

      <ServiceEditSheet open={editing !== undefined} onClose={() => setEditing(undefined)} service={editing ?? null} />
    </div>
  );
}
