import Link from "next/link";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { QuotationBuilder } from "@/components/quotations/QuotationBuilder";
import { createClient } from "@/lib/supabase/server";
import { todayIST } from "@/lib/dates";
import { S } from "@/lib/strings";

export const metadata = { title: S.quotation.builder };

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientId } = await searchParams;

  if (!clientId) {
    return (
      <>
        <ScreenHeader title={S.quotation.builder} backHref="/clients" />
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-ink-soft">
            Start a quotation from a client&rsquo;s profile — open a client, then tap
            &ldquo;{S.client.newQuotation}&rdquo;.
          </p>
          <Link href="/clients" className="inline-block mt-4 text-sm text-accent font-medium">
            Go to Clients →
          </Link>
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const [{ data: client }, { data: shop }, { data: services }] = await Promise.all([
    supabase.from("clients").select("id, name, company, phone, address").eq("id", clientId).maybeSingle(),
    supabase
      .from("shops")
      .select(
        "name, legal_name, address, city, state, pincode, phone, email, gstin, upi_id, built_by_credit, default_greeting, sqft_rounding, quotation_terms, message_templates",
      )
      .single(),
    supabase
      .from("services")
      .select("id, name, category, unit, default_rate, gst_rate")
      .eq("active", true)
      .order("sort_order"),
  ]);

  if (!client || !shop) {
    return (
      <>
        <ScreenHeader title={S.quotation.builder} backHref="/clients" />
        <p className="px-6 py-16 text-center text-sm text-ink-soft">Client not found.</p>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title={S.quotation.builder} backHref={`/clients/${clientId}`} />
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
          messageTemplates: shop.message_templates,
          sqftRounding: shop.sqft_rounding,
        }}
        client={client}
        services={services ?? []}
        today={todayIST()}
        initialLines={[]}
        initialTerms={shop.quotation_terms ?? ""}
      />
    </>
  );
}
