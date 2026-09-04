import ExcelJS from "exceljs";
import { createClient, getProfile } from "@/lib/supabase/server";
import { todayIST } from "@/lib/dates";

/**
 * Settings -> "Export everything to Excel" (§8.7). One workbook, one sheet
 * per table, scoped to the signed-in shop. This is the trust-building
 * button: every table in §5's data model, verbatim, no reshaping.
 */
export async function GET() {
  const profile = await getProfile();
  if (!profile) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const shopId = profile.shop_id;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "The Infinity Art";
  workbook.created = new Date();

  async function addSheet(name: string, rows: Record<string, unknown>[] | null) {
    const sheet = workbook.addWorksheet(name);
    const data = rows ?? [];
    if (data.length === 0) {
      sheet.addRow(["No rows"]);
      return;
    }
    const columns = Object.keys(data[0]);
    sheet.columns = columns.map((key) => ({
      header: key,
      key,
      width: Math.min(40, Math.max(12, key.length + 4)),
    }));
    sheet.getRow(1).font = { bold: true };
    for (const row of data) {
      sheet.addRow(flatten(row));
    }
  }

  function flatten(row: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (Array.isArray(v)) out[k] = v.join(", ");
      else if (v !== null && typeof v === "object") out[k] = JSON.stringify(v);
      else out[k] = v;
    }
    return out;
  }

  // simple shop-scoped tables
  const direct: [string, string][] = [
    ["Clients", "clients"],
    ["Interactions", "interactions"],
    ["Follow ups", "follow_ups"],
    ["Services", "services"],
    ["Quotations", "quotations"],
    ["Jobs", "jobs"],
    ["Payments", "payments"],
    ["Expenses", "expenses"],
    ["Attachments", "attachments"],
  ];

  const [{ data: shop }, { data: profiles }] = await Promise.all([
    supabase.from("shops").select("*").eq("id", shopId),
    supabase.from("profiles").select("id, name, phone, role, created_at, updated_at").eq("shop_id", shopId),
  ]);
  await addSheet("Shop", shop);
  await addSheet("Profiles", profiles);

  const [{ data: quotations }, { data: jobs }] = await Promise.all([
    supabase.from("quotations").select("id").eq("shop_id", shopId),
    supabase.from("jobs").select("id").eq("shop_id", shopId),
  ]);
  const quotationIds = (quotations ?? []).map((q) => q.id);
  const jobIds = (jobs ?? []).map((j) => j.id);

  for (const [name, table] of direct) {
    const { data } = await supabase.from(table).select("*").eq("shop_id", shopId);
    await addSheet(name, data);
  }

  const { data: quotationItems } = quotationIds.length
    ? await supabase.from("quotation_items").select("*").in("quotation_id", quotationIds)
    : { data: [] };
  await addSheet("Quotation items", quotationItems);

  const { data: stageEvents } = jobIds.length
    ? await supabase.from("job_stage_events").select("*").in("job_id", jobIds)
    : { data: [] };
  await addSheet("Job stage events", stageEvents);

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `the-infinity-art-export-${todayIST()}.xlsx`;

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
