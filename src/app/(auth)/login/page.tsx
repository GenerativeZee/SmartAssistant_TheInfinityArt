import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { S } from "@/lib/strings";

export const metadata = { title: S.auth.signIn };

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center px-6 bg-paper">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Mark />
          <h1 className="head text-2xl text-ink mt-4">{S.appName}</h1>
          <p className="text-ink-faint text-sm mt-1">
            Clients, quotations, jobs and payments — in one place.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-6">
          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function Mark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <rect width="44" height="44" rx="10" className="fill-ink" />
      <path
        d="M14 17c-3.3 0-5.4 2.2-5.4 4.9s2.1 4.9 5.4 4.9c2.9 0 4.6-1.9 7.4-4.9 2.8-3 4.5-4.9 7.4-4.9 3.3 0 5.4 2.2 5.4 4.9s-2.1 4.9-5.4 4.9c-2.9 0-4.6-1.9-7.4-4.9"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        className="text-accent"
      />
    </svg>
  );
}
