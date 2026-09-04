"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { S } from "@/lib/strings";
import { IconAaj, IconClients, IconJobs, IconPaisa } from "./icons";

const TABS = [
  { href: "/aaj", label: S.tabs.aaj, Icon: IconAaj },
  { href: "/clients", label: S.tabs.clients, Icon: IconClients },
  { href: "/jobs", label: S.tabs.jobs, Icon: IconJobs },
  { href: "/paisa", label: S.tabs.paisa, Icon: IconPaisa },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 backdrop-blur safe-b">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[calc(var(--tap)+8px)] flex-col items-center justify-center gap-1 py-2 text-[11px]",
                  active ? "text-accent" : "text-ink-faint",
                )}
              >
                <Icon width={22} height={22} />
                <span className={cn(active && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
