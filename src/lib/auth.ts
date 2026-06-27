import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

export type AppRole = Database["app_role"];

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  roles: AppRole[];
};

// Haalt de ingelogde gebruiker + diens rollen op (server-side).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? null,
    roles: (roleRows?.map((r) => r.role) ?? []) as AppRole[],
  };
}

export function hasRole(user: CurrentUser | null, role: AppRole): boolean {
  return !!user?.roles.includes(role);
}

export function isAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, "admin");
}
