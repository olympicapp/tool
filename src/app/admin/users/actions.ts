"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { APP_ROLES, type Database } from "@/lib/types";

type AppRole = Database["app_role"];

async function assertAdmin() {
  const me = await getCurrentUser();
  if (!isAdmin(me)) throw new Error("Geen rechten voor gebruikersbeheer.");
  return me!;
}

function parseRole(value: FormDataEntryValue | null): AppRole {
  const role = String(value) as AppRole;
  if (!APP_ROLES.includes(role)) throw new Error("Ongeldige rol.");
  return role;
}

export async function createUser(formData: FormData): Promise<void> {
  await assertAdmin();
  const email = String(formData.get("email")).trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(error.message);

  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: data.user.id, role });
  if (roleError) throw new Error(roleError.message);

  revalidatePath("/admin/users");
}

export async function setUserRole(formData: FormData): Promise<void> {
  await assertAdmin();
  const userId = String(formData.get("user_id"));
  const role = parseRole(formData.get("role"));

  const admin = createAdminClient();
  await admin.from("user_roles").delete().eq("user_id", userId);
  const { error } = await admin
    .from("user_roles")
    .insert({ user_id: userId, role });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const me = await assertAdmin();
  const userId = String(formData.get("user_id"));
  if (userId === me.id) throw new Error("Je kunt je eigen account niet verwijderen.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}
