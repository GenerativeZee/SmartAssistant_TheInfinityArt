"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type LoginState } from "./actions";
import { S } from "@/lib/strings";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/aaj";
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm text-ink-soft">{S.auth.email}</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          className="mt-1 w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-soft">{S.auth.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-3 text-ink outline-none focus:border-accent"
        />
      </label>

      {state.error && <p className="text-sm text-owed">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-[var(--tap)] rounded-[var(--radius-card)] bg-accent text-accent-ink font-medium disabled:opacity-60"
      >
        {pending ? S.common.loading : S.auth.signInCta}
      </button>
    </form>
  );
}
