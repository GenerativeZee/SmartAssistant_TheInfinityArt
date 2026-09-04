import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { todayIST } from "@/lib/dates";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Fab } from "@/components/ui/Fab";
import { ToastProvider } from "@/components/ui/Toast";
import { QuickAddProvider } from "@/components/quick-add/QuickAddProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <ToastProvider>
      <QuickAddProvider today={todayIST()} shopId={profile.shop_id}>
        <div className="mx-auto min-h-dvh max-w-lg bg-paper">
          <main className="pb-[calc(var(--tap)+40px)]">{children}</main>
          <Fab />
          <BottomTabs />
        </div>
      </QuickAddProvider>
    </ToastProvider>
  );
}
