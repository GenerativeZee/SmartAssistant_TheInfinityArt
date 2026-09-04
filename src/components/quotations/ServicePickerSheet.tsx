"use client";

import { Sheet } from "@/components/ui/Sheet";
import { formatMoney } from "@/lib/money";
import { S } from "@/lib/strings";
import { CATEGORY_LABEL, UNIT_LABEL, type ServiceOption } from "./types";

export function ServicePickerSheet({
  open,
  onClose,
  services,
  onPick,
  onCustom,
}: {
  open: boolean;
  onClose: () => void;
  services: ServiceOption[];
  onPick: (service: ServiceOption) => void;
  onCustom: () => void;
}) {
  const groups = groupBy(services, (s) => s.category);

  return (
    <Sheet open={open} onClose={onClose} title={S.quotation.addItem} tall>
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            onCustom();
            onClose();
          }}
          className="min-h-[var(--tap)] rounded-[var(--radius-card)] border border-dashed border-hairline text-sm text-ink-soft text-left px-3"
        >
          + Custom item (not on the rate card)
        </button>

        {Object.entries(groups).map(([category, list]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">
              {CATEGORY_LABEL[category] ?? category}
            </h3>
            <ul className="divide-y divide-hairline rounded-[var(--radius-card)] border border-hairline overflow-hidden">
              {list.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(s);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 text-left bg-surface active:bg-surface-sunken"
                  >
                    <span className="text-sm text-ink">{s.name}</span>
                    <span className="num text-xs text-ink-soft shrink-0">
                      {formatMoney(s.default_rate)} / {UNIT_LABEL[s.unit]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function groupBy<T>(list: T[], key: (t: T) => string): Record<string, T[]> {
  return list.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}
