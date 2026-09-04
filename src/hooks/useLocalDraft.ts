"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Form state backed by localStorage so a dropped connection or an incoming call
 * never loses an entry (§10). Call `clear()` after a successful save.
 *
 * Only mount this in components that render client-side only (e.g. inside an
 * `open &&` gate) — the lazy initialiser reads localStorage synchronously, so
 * there is no SSR/hydration mismatch to guard against.
 */
export function useLocalDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch {
      return initial; // private mode / blocked storage
    }
  });
  const loaded = useRef(true);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, clear] as const;
}
