import { z } from "zod";
import { uuidLike } from "./common";

export const PAYMENT_MODES = ["cash", "upi", "bank", "cheque"] as const;

export const recordPaymentSchema = z.object({
  clientId: uuidLike,
  jobId: uuidLike.nullable().optional(),
  amount: z.coerce.number().positive(),
  mode: z.enum(PAYMENT_MODES),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(500).optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
