import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { signOut } from "@/lib/auth-actions";

export default async function AppHeader() {
  const me = await getCurrentUser();
  if (!me) return null;

  const role = me.roles[0];
  const roleLabel = role ? ROLE_LABELS[role] : "geen rol";

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Olympic <span className="text-cyan-400">Tools</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/account/security" className="text-neutral-400 hover:text-neutral-100">
            Beveiliging
          </Link>
          {isAdmin(me) && (
            <Link href="/admin/users" className="text-neutral-400 hover:text-neutral-100">
              Gebruikers
            </Link>
          )}
          <span className="hidden items-center gap-2 sm:flex">
            <span className="text-neutral-300">{me.email}</span>
            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">
              {roleLabel}
            </span>
          </span>
          <form action={signOut}>
            <button className="rounded-lg border border-neutral-700 px-3 py-1.5 text-neutral-300 transition hover:bg-neutral-800">
              Uitloggen
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
