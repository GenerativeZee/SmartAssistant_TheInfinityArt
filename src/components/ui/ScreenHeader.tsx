import Link from "next/link";
import { IconGear } from "./icons";
import { S } from "@/lib/strings";

interface Props {
  title: string;
  subtitle?: string;
  /** hide the settings cog (e.g. on the settings screen itself) */
  hideSettings?: boolean;
  right?: React.ReactNode;
  /** shows a back chevron linking here (detail screens, not tab roots) */
  backHref?: string;
}

export function ScreenHeader({ title, subtitle, hideSettings, right, backHref }: Props) {
  return (
    <header className="safe-t sticky top-0 z-30 bg-paper/95 backdrop-blur px-4 pt-3 pb-2 border-b border-hairline">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-surface-sunken -ml-1.5 mt-0.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="head text-xl text-ink leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-ink-faint mt-0.5 truncate">{subtitle}</p>}
          </div>
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
