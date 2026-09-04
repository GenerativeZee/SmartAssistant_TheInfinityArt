import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ShopProfileForm } from "@/components/settings/ShopProfileForm";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";

export const metadata = { title: S.settings.shopProfile };

export default async function ShopProfilePage() {
  const supabase = await createClient();
  const { data: shop } = await supabase.from("shops").select("*").single();

  if (!shop) return null;

  return (
    <>
      <ScreenHeader title={S.settings.shopProfile} backHref="/settings" />
      <div className="px-4 py-4">
        <ShopProfileForm
          shop={{
            id: shop.id,
            name: shop.name,
            legal_name: shop.legal_name,
            logo_url: shop.logo_url,
            address: shop.address,
            city: shop.city,
            state: shop.state,
            pincode: shop.pincode,
            phone: shop.phone,
            whatsapp_number: shop.whatsapp_number,
            email: shop.email,
            gstin: shop.gstin,
            upi_id: shop.upi_id,
            upi_qr_url: shop.upi_qr_url,
            default_gst_rate: Number(shop.default_gst_rate),
            sqft_rounding: shop.sqft_rounding,
            default_greeting: shop.default_greeting,
            quotation_terms: shop.quotation_terms,
          }}
        />
      </div>
    </>
  );
}
