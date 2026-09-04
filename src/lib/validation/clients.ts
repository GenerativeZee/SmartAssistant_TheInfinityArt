import { z } from "zod";
import { normalizePhone, isValidPhone } from "@/lib/phone";

export const REQUIREMENT_KEYS = [
  "signage",
  "print",
  "wedding",
  "branding",
  "web",
  "mockup",
  "other",
] as const;
export type RequirementKey = (typeof REQUIREMENT_KEYS)[number];

export const WHAT_NEXT = ["call_back", "quotation", "demo", "nothing"] as const;
export type WhatNext = (typeof WHAT_NEXT)[number];

export const quickAddSchema = z.object({
  phone: z
    .string()
    .transform(normalizePhone)
    .refine(isValidPhone, "10 digit ka sahi number daaliye"),
  name: z.string().trim().min(1, "Naam likhiye").max(120),
  requirements: z.array(z.enum(REQUIREMENT_KEYS)).max(7).default([]),
  whatNext: z.enum(WHAT_NEXT).default("nothing"),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  voiceUrl: z.string().url().optional(),
  /** set when the phone matched an existing client on blur */
  existingClientId: z.string().uuid().optional(),
});

export type QuickAddInput = z.input<typeof quickAddSchema>;
