import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { QuotationBuilder } from "@/components/quotations/QuotationBuilder";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";
import type { BuilderLine } from "@/components/quotations/types";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle();
  if (!quotation) notFound();

  const [{ data: client }, { data: shop }, { data: services }, { data: items }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, company, phone, address")
      .eq("id", quotation.client_id)
      .single(),
    supabase
      .from("shops")
      .select(
        "name, legal_name, address, city, state, pincode, phone, email, gstin, upi_id, built_by_credit, default_greeting, sqft_rounding",
      )
      .single(),
    supabase
      .from("services")
      .select("id, name, category, unit, default_rate, gst_rate")
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .order("sort_order"),
  ]);

  if (!client || !shop) notFound();

  const initialLines: BuilderLine[] = (items ?? []).map((it, i) => ({
    key: `existing-${i}`,
    serviceId: it.service_id,
    description: it.description,
    unit: it.unit,
    qty: Number(it.qty),
    widthFt: it.width_ft !== null ? Number(it.width_ft) : null,
    heightFt: it.height_ft !== null ? Number(it.height_ft) : null,
    rate: Number(it.rate),
    gstRate: Number(it.gst_rate),
  }));

  return (
    <>
      <ScreenHeader title={quotation.number ?? S.quotation.title} backHref={`/clients/${client.id}`} />
      <QuotationBuilder
        shop={{
          name: shop.name,
          legalName: shop.legal_name,
          address: shop.address,
          city: shop.city,
          state: shop.state,
          pincode: shop.pincode,
          phone: shop.phone,
          email: shop.email,
          gstin: shop.gstin,
          upiId: shop.upi_id,
          builtByCredit: shop.built_by_credit,
          defaultGreeting: shop.default_greeting,
          sqftRounding: shop.sqft_rounding,
        }}
        client={client}
        services={services ?? []}
        quotationId={quotation.id}
        quotationNumber={quotation.number ?? undefined}
        status={quotation.status}
        sentAt={quotation.sent_at}
        initialLines={initialLines}
        initialDiscount={Number(quotation.discount)}
        initialNotes={quotation.notes ?? ""}
        initialTerms={quotation.terms ?? ""}
      />
    </>
  );
}
