import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Next 16: the `middleware` convention was renamed to `proxy` (nodejs runtime).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static image assets. The auth check
     * lives inside updateSession so the manifest / icons stay reachable when
     * logged out.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
