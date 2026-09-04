import { formatMoney } from "@/lib/money";
import { S } from "@/lib/strings";
import { cn } from "@/lib/cn";

/** balance > 0: owes us (magenta). balance < 0: he's in credit / advance (accent). */
export function BalanceTag({ balance, size = "sm" }: { balance: number; size?: "sm" | "md" }) {
  if (!balance) return null;
  const owed = balance > 0;
  return (
    <span
      className={cn(
        "num inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        owed ? "bg-owed-wash text-owed" : "bg-accent-wash text-accent",
      )}
    >
      {owed ? formatMoney(balance) : `${S.client.advance} ${formatMoney(Math.abs(balance))}`}
    </span>
  );
}
