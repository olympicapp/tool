import { createClient } from "@supabase/supabase-js";

// Service-role client — ALLEEN server-side gebruiken (in server actions/route handlers).
// Omzeilt RLS; nooit naar de client lekken.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
