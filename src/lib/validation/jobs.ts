import { z } from "zod";
import { uuidLike } from "./common";

export const STAGES = [
  "design",
  "approval",
  "print",
  "finishing",
  "installation",
  "delivered",
  "cancelled",
] as const;
export type Stage = (typeof STAGES)[number];

export const PAYMENT_MODES = ["cash", "upi", "bank", "cheque"] as const;

export const wonInputSchema = z.object({
  quotationId: uuidLike,
  promisedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startingStage: z.enum(STAGES).default("design"),
  advanceAmount: z.coerce.number().min(0).default(0),
  advanceMode: z.enum(PAYMENT_MODES).default("cash"),
});

export const advanceStageSchema = z.object({
  jobId: uuidLike,
  toStage: z.enum(STAGES),
  note: z.string().trim().max(500).optional(),
});

export const deliverJobSchema = z.object({
  jobId: uuidLike,
  note: z.string().trim().max(500).optional(),
  finalAmount: z.coerce.number().min(0).default(0),
  finalMode: z.enum(PAYMENT_MODES).default("cash"),
});

export const cancelJobSchema = z.object({
  jobId: uuidLike,
  note: z.string().trim().max(500).optional(),
});

export const attachmentSchema = z.object({
  entityType: z.enum(["client", "quotation", "job"]),
  entityId: uuidLike,
  url: z.string().url(),
  filename: z.string().trim().max(200).optional(),
  kind: z.enum(["artwork", "approval", "install_photo", "other"]).default("other"),
});
