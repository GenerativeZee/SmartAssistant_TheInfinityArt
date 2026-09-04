/**
 * generate PDF -> upload to Supabase Storage -> public URL, in one call (§7).
 * Reused by quotation, invoice and receipt shares. Browser-only — call this
 * from a client component (a WhatsApp/Preview button handler), never from a
 * Server Component or Server Action.
 */
import type { ReactElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createClient } from "./supabase/client";

export async function renderPdfBlob(doc: ReactElement<DocumentProps>): Promise<Blob> {
  return pdf(doc).toBlob();
}

export async function uploadPdf(bucket: string, path: string, blob: Blob): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function sharePdf(doc: ReactElement<DocumentProps>, bucket: string, path: string): Promise<string> {
  const blob = await renderPdfBlob(doc);
  return uploadPdf(bucket, path, blob);
}
