"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { S } from "@/lib/strings";

type State = "idle" | "recording" | "uploading" | "done" | "error";

export function VoiceNote({
  shopId,
  value,
  onChange,
}: {
  shopId: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}) {
  const [state, setState] = useState<State>(value ? "done" : "idle");
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => void upload(stream);
      rec.start();
      recorderRef.current = rec;
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setState("recording");
    } catch {
      setState("error");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function upload(stream: MediaStream) {
    setState("uploading");
    stream.getTracks().forEach((t) => t.stop());
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const path = `${shopId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webm`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("voice").upload(path, blob, {
      contentType: "audio/webm",
    });
    if (error) {
      setState("error");
      return;
    }
    const { data } = supabase.storage.from("voice").getPublicUrl(path);
    onChange(data.publicUrl);
    setState("done");
  }

  function discard() {
    onChange(undefined);
    setState("idle");
    setSeconds(0);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={state === "recording" ? stop : start}
        disabled={state === "uploading"}
        className={cn(
          "h-11 w-11 shrink-0 rounded-full grid place-items-center border",
          state === "recording"
            ? "bg-owed border-owed text-white animate-pulse"
            : "bg-surface border-hairline text-ink-soft",
        )}
        aria-label={S.quickAdd.voiceNote}
      >
        <MicIcon />
      </button>

      <div className="text-sm text-ink-soft">
        {state === "idle" && S.quickAdd.voiceNote}
        {state === "recording" && `${S.quickAdd.voiceNote}… ${seconds}s`}
        {state === "uploading" && S.common.loading}
        {state === "done" && (
          <span className="flex items-center gap-2 text-ink">
            Voice note ✓
            <button type="button" onClick={discard} className="text-owed underline">
              Hata do
            </button>
          </span>
        )}
        {state === "error" && <span className="text-owed">Mic nahi mila</span>}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}
