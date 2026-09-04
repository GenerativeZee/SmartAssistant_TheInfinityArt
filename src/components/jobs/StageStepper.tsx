"use client";

import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";
import type { Stage } from "@/lib/validation/jobs";

const FLOW: Stage[] = ["design", "approval", "print", "finishing", "installation", "delivered"];

/** Horizontal stepper — tap any node to jump the job to that stage (§8.5). */
export function StageStepper({
  stage,
  onTap,
  disabled,
}: {
  stage: Stage;
  onTap: (stage: Stage) => void;
  disabled?: boolean;
}) {
  if (stage === "cancelled") {
    return (
      <div className="rounded-[var(--radius-card)] border border-owed/30 bg-owed-wash px-4 py-3 text-sm text-owed font-medium">
        {S.stages.cancelled}
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(stage);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex items-start" style={{ minWidth: 480 }}>
        {FLOW.map((s, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          return (
            <div key={s} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <span
                  className={cn(
                    "absolute top-[13px] right-1/2 w-full h-[2px] -z-0",
                    i <= currentIndex ? "bg-accent" : "bg-hairline",
                  )}
                />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => !current && onTap(s)}
                className={cn(
                  "relative z-10 h-7 w-7 rounded-full grid place-items-center border-2 text-[10px] font-bold shrink-0",
                  current
                    ? "bg-accent border-accent text-accent-ink"
                    : done
                      ? "bg-accent-wash border-accent text-accent"
                      : "bg-surface border-hairline text-ink-faint",
                )}
              >
                {done ? "✓" : i + 1}
              </button>
              <span
                className={cn(
                  "mt-1.5 text-[10px] text-center leading-tight",
                  current ? "text-ink font-semibold" : "text-ink-faint",
                )}
              >
                {S.stages[s]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
