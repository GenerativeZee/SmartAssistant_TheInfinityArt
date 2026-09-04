import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { S } from "@/lib/strings";

export const metadata = { title: S.auth.signIn };

export default function LoginPage() {
  return (
    <main className="min-h-dvh grid place-items-center px-6 bg-paper">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="num text-sm text-accent tracking-widest">INF</p>
          <h1 className="head text-2xl text-ink mt-1">{S.appName}</h1>
          <p className="text-ink-soft text-sm mt-1">Client · quotation · job · paisa</p>
        </div>
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
