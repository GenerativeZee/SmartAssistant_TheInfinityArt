"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { TextInput } from "@/components/ui/Field";

export function ClientSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(v: string) {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const sp = new URLSearchParams(params);
      if (v.trim()) sp.set("q", v.trim());
      else sp.delete("q");
      router.replace(`${pathname}?${sp.toString()}`);
    }, 250);
  }

  return (
    <TextInput
      type="search"
      inputMode="search"
      placeholder="Search by name or phone"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface"
    />
  );
}
