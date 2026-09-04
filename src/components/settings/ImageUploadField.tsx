"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export function ImageUploadField({
  label,
  currentUrl,
  bucket,
  pathPrefix,
  onSaved,
}: {
  label: string;
  currentUrl: string | null;
  bucket: string;
  pathPrefix: string;
  /** persists the new public URL onto the shop row */
  onSaved: (url: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${pathPrefix}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const res = await onSaved(data.publicUrl);
      if (!res.ok) throw new Error(res.error);
      toast("Saved");
      router.refresh();
    } catch {
      toast("Could not upload the image", "err");
    }
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-3">
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt={label} className="h-14 w-14 rounded-[10px] object-cover border border-hairline" />
      ) : (
        <div className="h-14 w-14 rounded-[10px] border border-dashed border-hairline grid place-items-center text-[10px] text-ink-faint">
          None
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-ink-soft">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-accent font-medium mt-0.5"
        >
          {uploading ? "Uploading…" : currentUrl ? "Change" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
    </div>
  );
}
