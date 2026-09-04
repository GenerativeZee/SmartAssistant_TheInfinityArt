import Link from "next/link";
import { IconGear } from "./icons";
import { S } from "@/lib/strings";

interface Props {
  title: string;
  subtitle?: string;
  /** hide the settings cog (e.g. on the settings screen itself) */
  hideSettings?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, hideSettings, right }: Props) {
  return (
    <header className="safe-t sticky top-0 z-30 bg-paper/95 backdrop-blur px-4 pt-3 pb-2 border-b border-hairline">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="head text-xl text-ink leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {right}
          {!hideSettings && (
            <Link
              href="/settings"
              aria-label={S.nav.settings}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken"
            >
              <IconGear width={20} height={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
