"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ImageUploadField } from "./ImageUploadField";
import { updateShopProfile, setShopLogoUrl, setShopUpiQrUrl } from "@/lib/actions/shop";
import { S } from "@/lib/strings";

export interface ShopProfile {
  id: string;
  name: string;
  legal_name: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  gstin: string | null;
  upi_id: string | null;
  upi_qr_url: string | null;
  default_gst_rate: number;
  sqft_rounding: "none" | "up_to_whole";
  default_greeting: string;
  quotation_terms: string | null;
}

export function ShopProfileForm({ shop }: { shop: ShopProfile }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(shop.name);
  const [legalName, setLegalName] = useState(shop.legal_name ?? "");
  const [address, setAddress] = useState(shop.address ?? "");
  const [city, setCity] = useState(shop.city ?? "");
  const [state, setState] = useState(shop.state ?? "");
  const [pincode, setPincode] = useState(shop.pincode ?? "");
  const [phone, setPhone] = useState(shop.phone ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(shop.whatsapp_number ?? "");
  const [email, setEmail] = useState(shop.email ?? "");
  const [gstin, setGstin] = useState(shop.gstin ?? "");
  const [upiId, setUpiId] = useState(shop.upi_id ?? "");
  const [gstRate, setGstRate] = useState(String(shop.default_gst_rate));
  const [rounding, setRounding] = useState(shop.sqft_rounding);
  const [greeting, setGreeting] = useState(shop.default_greeting);
  const [terms, setTerms] = useState(shop.quotation_terms ?? "");

  function save() {
    startTransition(async () => {
      const res = await updateShopProfile({
        name,
        legalName,
        address,
        city,
        state,
        pincode,
        phone,
        whatsappNumber,
        email,
        gstin,
        upiId,
        defaultGstRate: Number(gstRate) || 0,
        sqftRounding: rounding,
        defaultGreeting: greeting,
        quotationTerms: terms,
      });
      if (!res.ok) {
        toast(res.error, "err");
        return;
      }
      toast(S.common.saved);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-4 flex flex-col gap-4">
        <ImageUploadField
          label={S.settings.logo}
          currentUrl={shop.logo_url}
          bucket="logos"
          pathPrefix={`${shop.id}/logo`}
          onSaved={setShopLogoUrl}
        />
        <ImageUploadField
          label={S.settings.upiQr}
          currentUrl={shop.upi_qr_url}
          bucket="logos"
          pathPrefix={`${shop.id}/upi-qr`}
          onSaved={setShopUpiQrUrl}
        />
      </div>

      <Field label="Shop name">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Legal name">
        <TextInput value={legalName} onChange={(e) => setLegalName(e.target.value)} />
      </Field>
      <Field label="Address">
        <TextInput value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="City">
          <TextInput value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label="State">
          <TextInput value={state} onChange={(e) => setState(e.target.value)} />
        </Field>
        <Field label="Pincode">
          <TextInput value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Phone">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <TextInput value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
        </Field>
      </div>
      <Field label="Email">
        <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label={S.settings.gstin}>
        <TextInput value={gstin} onChange={(e) => setGstin(e.target.value)} />
      </Field>
      <Field label={S.settings.upiId}>
        <TextInput value={upiId} onChange={(e) => setUpiId(e.target.value)} />
      </Field>
      <Field label={S.settings.gstRate}>
        <TextInput inputMode="decimal" value={gstRate} onChange={(e) => setGstRate(e.target.value.replace(/[^\d.]/g, ""))} />
      </Field>
      <div>
        <span className="text-sm text-ink-soft">{S.settings.sqftRounding}</span>
        <div className="mt-1.5 flex gap-2">
          <Chip active={rounding === "up_to_whole"} onClick={() => setRounding("up_to_whole")}>
            Round up to whole sq.ft
          </Chip>
          <Chip active={rounding === "none"} onClick={() => setRounding("none")}>
            Exact
          </Chip>
        </div>
      </div>
      <Field label={S.settings.greeting} hint="Used in WhatsApp messages, e.g. “ji”">
        <TextInput value={greeting} onChange={(e) => setGreeting(e.target.value)} className="w-24" />
      </Field>
      <Field label={S.settings.terms}>
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={4}
          className="w-full rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent resize-none"
        />
      </Field>

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? S.common.loading : S.actions.save}
      </Button>
    </div>
  );
}
