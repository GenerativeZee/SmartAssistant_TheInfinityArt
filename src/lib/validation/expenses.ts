import { z } from "zod";
import { uuidLike } from "./common";

export const EXPENSE_CATEGORIES = ["material", "labour", "transport", "rent", "other"] as const;

export const expenseInputSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce.number().positive(),
  spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(500).optional(),
  jobId: uuidLike.nullable().optional(),
});
export type ExpenseInput = z.infer<typeof expenseInputSchema>;
