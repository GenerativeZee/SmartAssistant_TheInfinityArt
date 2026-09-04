import { z } from "zod";

const opt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

export const shopProfileSchema = z.object({
  name: z.string().trim().min(1, "Enter a shop name").max(200),
  legalName: opt(200),
  address: opt(300),
  city: opt(100),
  state: opt(100),
  pincode: opt(10),
  phone: opt(20),
  whatsappNumber: opt(20),
  email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  gstin: opt(20),
  upiId: opt(100),
  defaultGstRate: z.coerce.number().min(0).max(28),
  sqftRounding: z.enum(["none", "up_to_whole"]),
  defaultGreeting: z.string().trim().min(1, "Enter a greeting word").max(20),
  quotationTerms: opt(4000),
});
export type ShopProfileInput = z.infer<typeof shopProfileSchema>;

export const TEMPLATE_KEYS = ["quotation", "paymentReminder", "delivery", "receipt"] as const;

export const templatesInputSchema = z.record(z.enum(TEMPLATE_KEYS), z.string().trim().max(1000));
