// Lichtgewicht typehulpen voor de app-rollen.
// (Later evt. vervangen door gegenereerde Supabase-types.)
export type Database = {
  app_role: "medewerker" | "manager" | "directie" | "admin";
};

export const APP_ROLES: Database["app_role"][] = [
  "medewerker",
  "manager",
  "directie",
  "admin",
];

export const ROLE_LABELS: Record<Database["app_role"], string> = {
  medewerker: "Medewerker",
  manager: "Manager",
  directie: "Directie",
  admin: "Admin",
};
