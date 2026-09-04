import { z } from "zod";
import { uuidLike } from "./common";

export const SERVICE_CATEGORIES = ["signage", "print", "wedding", "branding", "web", "other"] as const;
export const SERVICE_UNITS = ["sqft", "piece", "box", "job", "hour"] as const;

export const serviceInputSchema = z.object({
  id: uuidLike.optional(),
  name: z.string().trim().min(1, "Enter a name").max(120),
  category: z.enum(SERVICE_CATEGORIES),
  unit: z.enum(SERVICE_UNITS),
  defaultRate: z.coerce.number().min(0),
  gstRate: z.coerce.number().min(0).max(28),
  hsnSac: z.string().trim().max(20).optional(),
  active: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceInputSchema>;
