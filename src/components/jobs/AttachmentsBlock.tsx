"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addAttachment } from "@/lib/actions/jobs";
import { useToast } from "@/components/ui/Toast";
import { S } from "@/lib/strings";

export interface AttachmentItem {
  id: string;
  url: string;
  filename: string | null;
  kind: string;
}

export function AttachmentsBlock({ jobId, items }: { jobId: string; items: AttachmentItem[] }) {
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
      const path = `${jobId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("artwork").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("artwork").getPublicUrl(path);
      const res = await addAttachment({
        entityType: "job",
        entityId: jobId,
        url: data.publicUrl,
        filename: file.name,
        kind: "other",
      });
      if (!res.ok) throw new Error(res.error);
      router.refresh();
    } catch {
      toast("Could not upload the file", "err");
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{S.job.attachments}</h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-accent font-medium"
        >
          {uploading ? S.common.loading : "+ Add"}
        </button>
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onFile} />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-ink-faint mt-2">{S.common.empty}</p>
      ) : (
        <ul className="mt-2 flex gap-2 overflow-x-auto">
          {items.map((a) => (
            <li key={a.id} className="shrink-0">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="block h-16 w-16 rounded-[10px] border border-hairline bg-surface-sunken overflow-hidden"
              >
                {isImage(a.filename ?? a.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt={a.filename ?? "attachment"} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[9px] text-ink-faint px-1 text-center">
                    {a.filename ?? "File"}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function isImage(name: string) {
  return /\.(png|jpe?g|webp|gif|heic)$/i.test(name);
}
