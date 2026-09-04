import { z } from "zod";

export const lineItemSchema = z.object({
  serviceId: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1, "Describe this line").max(200),
  unit: z.enum(["sqft", "piece", "box", "job", "hour"]),
  qty: z.coerce.number().positive().max(100000),
  widthFt: z.coerce.number().positive().max(1000).nullable().optional(),
  heightFt: z.coerce.number().positive().max(1000).nullable().optional(),
  rate: z.coerce.number().min(0).max(10000000),
  gstRate: z.coerce.number().min(0).max(28),
});
export type LineItemInput = z.infer<typeof lineItemSchema>;

export const quotationInputSchema = z.object({
  clientId: z.string().uuid(),
  items: z.array(lineItemSchema).min(1, "Add at least one item"),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(2000).optional().nullable(),
  terms: z.string().trim().max(4000).optional().nullable(),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
});
export type QuotationInput = z.infer<typeof quotationInputSchema>;

export const lostSchema = z.object({
  id: z.string().uuid(),
  reason: z.enum(["price", "timeline", "no_response", "went_elsewhere", "cancelled_project", "other"]),
  note: z.string().trim().max(500).optional(),
});
