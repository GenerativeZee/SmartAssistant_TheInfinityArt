"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocalDraft } from "@/hooks/useLocalDraft";
import { useToast } from "@/components/ui/Toast";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { TextInput, Field } from "@/components/ui/Field";
import { VoiceNote } from "./VoiceNote";
import { findClientByPhone, quickAdd } from "@/lib/actions/clients";
import { normalizePhone } from "@/lib/phone";
import { addDaysIST } from "@/lib/dates";
import { S } from "@/lib/strings";
import { REQUIREMENT_KEYS, type RequirementKey, type WhatNext } from "@/lib/validation/clients";
import { cn } from "@/lib/cn";

interface Draft {
  phone: string;
  name: string;
  requirements: RequirementKey[];
  whatNext: WhatNext;
  followUpDate: string;
  voiceUrl?: string;
}

const REQ_LABEL: Record<RequirementKey, string> = {
  signage: S.requirementChips.signage,
  print: S.requirementChips.print,
  wedding: S.requirementChips.wedding,
  branding: S.requirementChips.branding,
  web: S.requirementChips.web,
  mockup: S.requirementChips.mockup,
  other: S.requirementChips.other,
};

const WHAT_NEXT_LABEL: Record<WhatNext, string> = {
  call_back: S.quickAdd.callBack,
  quotation: S.quickAdd.sendQuote,
  demo: S.quickAdd.showDemo,
  nothing: S.quickAdd.nothing,
};

export function QuickAddForm({
  today,
  shopId,
  onDone,
}: {
  today: string;
  shopId: string;
  onDone: () => void;
}) {
  const draftKey = "quickadd:draft";
  const [draft, setDraft, clearDraft] = useLocalDraft<Draft>(draftKey, {
    phone: "",
    name: "",
    requirements: [],
    whatNext: "nothing",
    followUpDate: addDaysIST(today, 1),
  });

  const [existing, setExisting] = useState<{ id: string; name: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function onPhoneBlur() {
    const digits = normalizePhone(draft.phone);
    if (digits.length !== 10) return;
    const match = await findClientByPhone(digits);
    if (match) {
      setExisting({ id: match.id, name: match.name });
      if (!draft.name.trim()) patch({ name: match.name });
      toast(S.quickAdd.existingToast(match.name));
    } else {
      setExisting(null);
    }
  }

  function pickWhatNext(w: WhatNext) {
    patch({ whatNext: w, followUpDate: draft.followUpDate || addDaysIST(today, 1) });
  }

  function toggleReq(r: RequirementKey) {
    patch({
      requirements: draft.requirements.includes(r)
        ? draft.requirements.filter((x) => x !== r)
        : [...draft.requirements, r],
    });
  }

  const phoneOk = normalizePhone(draft.phone).length === 10;
  const canSave = phoneOk && draft.name.trim().length > 0 && !pending;

  function save() {
    if (!canSave) return;
    startTransition(async () => {
      const res = await quickAdd({
        phone: draft.phone,
        name: draft.name.trim(),
        requirements: draft.requirements,
        whatNext: draft.whatNext,
        followUpDate: draft.whatNext !== "nothing" ? draft.followUpDate : undefined,
        voiceUrl: draft.voiceUrl,
        existingClientId: existing?.id,
      });
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      clearDraft();
      setExisting(null);
      onDone();
      toast(S.quickAdd.savedToast(res.name));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* 1. phone — numeric keypad, autofocus */}
      <Field label={S.quickAdd.phone}>
        <TextInput
          type="tel"
          inputMode="numeric"
          autoFocus
          autoComplete="tel"
          maxLength={10}
          placeholder="98765 43210"
          value={draft.phone}
          onChange={(e) => {
            patch({ phone: normalizePhone(e.target.value) });
            setExisting(null);
          }}
          onBlur={onPhoneBlur}
          className="num text-lg tracking-wide"
        />
      </Field>
      {existing && (
        <p className="-mt-3 text-xs text-accent">Purana client khula · {existing.name}</p>
      )}

      {/* 2. name */}
      <Field label={S.quickAdd.name}>
        <TextInput
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Naam"
        />
      </Field>

      {/* 3. requirement chips */}
      <Field label={S.quickAdd.requirement}>
        <div className="flex flex-wrap gap-2">
          {REQUIREMENT_KEYS.map((r) => (
            <Chip key={r} active={draft.requirements.includes(r)} onClick={() => toggleReq(r)}>
              {REQ_LABEL[r]}
            </Chip>
          ))}
        </div>
      </Field>

      {/* 4. what next */}
      <Field label={S.quickAdd.whatNext}>
        <div className="grid grid-cols-2 gap-2">
          {(["call_back", "quotation", "demo", "nothing"] as WhatNext[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => pickWhatNext(w)}
              className={cn(
                "min-h-[var(--tap)] rounded-[var(--radius-card)] border px-3 text-sm font-medium",
                draft.whatNext === w
                  ? "border-accent bg-accent-wash text-accent"
                  : "border-hairline bg-surface text-ink-soft",
              )}
            >
              {WHAT_NEXT_LABEL[w]}
            </button>
          ))}
        </div>

        {draft.whatNext !== "nothing" && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(
              [
                ["kal", S.quickAdd.kal, addDaysIST(today, 1)],
                ["2din", S.quickAdd.twoDays, addDaysIST(today, 2)],
                ["hafta", S.quickAdd.thisWeek, addDaysIST(today, 7)],
              ] as const
            ).map(([key, label, date]) => (
              <Chip key={key} size="sm" active={draft.followUpDate === date} onClick={() => patch({ followUpDate: date })}>
                {label}
              </Chip>
            ))}
            <input
              type="date"
              min={today}
              value={draft.followUpDate}
              onChange={(e) => patch({ followUpDate: e.target.value })}
              className="num h-8 rounded-full border border-hairline bg-surface px-3 text-xs text-ink-soft"
            />
          </div>
        )}
      </Field>

      {/* 5. voice note */}
      <VoiceNote shopId={shopId} value={draft.voiceUrl} onChange={(url) => patch({ voiceUrl: url })} />

      <Button onClick={save} disabled={!canSave} className="w-full mt-1">
        {pending ? S.common.loading : S.actions.save}
      </Button>
    </div>
  );
}
