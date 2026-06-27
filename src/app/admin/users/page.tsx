import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { APP_ROLES, ROLE_LABELS, type Database } from "@/lib/types";
import { createUser, setUserRole, deleteUser } from "./actions";

type AppRole = Database["app_role"];

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!isAdmin(me)) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
        <div className="mx-auto max-w-xl">
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
            Geen toegang — alleen voor admins.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-neutral-400">
            ← Terug
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .order("created_at");
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("user_id, role");

  const roleByUser = new Map<string, AppRole>();
  (roleRows ?? []).forEach((r) => roleByUser.set(r.user_id, r.role as AppRole));

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-100">
          ← Terug
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Gebruikers</h1>
        <p className="mt-2 text-neutral-400">
          Beheer wie toegang heeft en welke rol ze hebben.
        </p>

        {/* Nieuwe gebruiker */}
        <form
          action={createUser}
          className="mt-8 grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:grid-cols-2"
        >
          <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Nieuwe gebruiker
          </h2>
          <input
            name="full_name"
            placeholder="Naam"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-cyan-500"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-cyan-500"
          />
          <input
            name="password"
            required
            minLength={8}
            placeholder="Tijdelijk wachtwoord (min. 8)"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-cyan-500"
          />
          <select
            name="role"
            defaultValue="medewerker"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-cyan-500"
          >
            {APP_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button className="sm:col-span-2 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-neutral-950 transition hover:bg-cyan-400">
            Gebruiker aanmaken
          </button>
        </form>

        {/* Lijst */}
        <div className="mt-8 space-y-3">
          {(profiles ?? []).map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3"
            >
              <div>
                <p className="font-medium">{p.full_name || "—"}</p>
                <p className="text-sm text-neutral-400">{p.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <form action={setUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="user_id" value={p.id} />
                  <select
                    name="role"
                    defaultValue={roleByUser.get(p.id) ?? "medewerker"}
                    className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm outline-none focus:border-cyan-500"
                  >
                    {APP_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:bg-neutral-800">
                    Opslaan
                  </button>
                </form>
                {p.id !== me.id && (
                  <form action={deleteUser}>
                    <input type="hidden" name="user_id" value={p.id} />
                    <button className="rounded-lg border border-red-900/60 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-950/40">
                      Verwijderen
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
