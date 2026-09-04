"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateMessageTemplates } from "@/lib/actions/shop";
import {
  DEFAULT_TEMPLATES,
  TEMPLATE_LABELS,
  TEMPLATE_PLACEHOLDERS,
  type MessageTemplateOverrides,
} from "@/lib/messages";

type Key = keyof typeof DEFAULT_TEMPLATES;
const KEYS = Object.keys(DEFAULT_TEMPLATES) as Key[];

export function TemplatesEditor({ overrides }: { overrides: MessageTemplateOverrides }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [values, setValues] = useState<Record<Key, string>>(() =>
    Object.fromEntries(KEYS.map((k) => [k, overrides[k] ?? DEFAULT_TEMPLATES[k]])) as Record<Key, string>,
  );

  function save() {
    startTransition(async () => {
      const res = await updateMessageTemplates(values);
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      toast("Saved");
      router.refresh();
    });
  }

  function reset(key: Key) {
    setValues((v) => ({ ...v, [key]: DEFAULT_TEMPLATES[key] }));
  }

  return (
    <div className="flex flex-col gap-6">
      {KEYS.map((key) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-ink">{TEMPLATE_LABELS[key]}</span>
            <button type="button" onClick={() => reset(key)} className="text-xs text-accent">
              Reset to default
            </button>
          </div>
          <textarea
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            rows={4}
            className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent resize-none"
          />
          <p className="mt-1 text-[11px] text-ink-faint">
            Placeholders: {TEMPLATE_PLACEHOLDERS[key].map((p) => `{${p}}`).join(", ")}
          </p>
        </div>
      ))}

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save templates"}
      </Button>
    </div>
  );
}
