import type { Unit } from "@/lib/pricing";

export interface BuilderLine {
  key: string;
  serviceId: string | null;
  description: string;
  unit: Unit;
  qty: number;
  widthFt: number | null;
  heightFt: number | null;
  rate: number;
  gstRate: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  category: string;
  unit: Unit;
  default_rate: string | number;
  gst_rate: string | number | null;
}

export const UNIT_LABEL: Record<Unit, string> = {
  sqft: "sq.ft",
  piece: "piece",
  box: "box",
  job: "job",
  hour: "hour",
};

export const CATEGORY_LABEL: Record<string, string> = {
  signage: "Signage",
  print: "Print",
  wedding: "Wedding",
  branding: "Branding",
  web: "Web",
  other: "Other",
};

let seq = 0;
export function newLineKey(): string {
  seq += 1;
  return `l${Date.now()}${seq}`;
}
