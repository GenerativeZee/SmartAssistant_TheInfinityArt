import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { TemplatesEditor } from "@/components/settings/TemplatesEditor";
import { createClient } from "@/lib/supabase/server";
import { S } from "@/lib/strings";

export const metadata = { title: S.settings.templates };

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: shop } = await supabase.from("shops").select("message_templates").single();

  return (
    <>
      <ScreenHeader title={S.settings.templates} backHref="/settings" />
      <div className="px-4 py-4">
        <TemplatesEditor overrides={shop?.message_templates ?? {}} />
      </div>
    </>
  );
}
