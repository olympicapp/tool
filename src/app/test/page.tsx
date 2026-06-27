import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  // Test de Supabase-verbinding vanaf de server.
  let supabaseStatus = "✅ Verbonden met Supabase";
  let supabaseDetail = "";
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) {
      supabaseStatus = "⚠️ Supabase reageert, maar met een melding";
      supabaseDetail = error.message;
    }
  } catch (e) {
    supabaseStatus = "❌ Supabase-verbinding mislukt";
    supabaseDetail = e instanceof Error ? e.message : String(e);
  }

  const checks = [
    { label: "Next.js draait live op Vercel", value: "✅ OK" },
    { label: "Auto-deploy vanaf git push", value: "✅ OK (deze pagina is bewijs)" },
    { label: "Supabase-koppeling", value: supabaseStatus },
    {
      label: "Env-var NEXT_PUBLIC_SUPABASE_URL",
      value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Aanwezig" : "❌ Ontbreekt",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          Testpagina
        </p>
        <h1 className="mt-2 text-3xl font-bold">Alles werkt? 🧪</h1>
        <p className="mt-2 text-neutral-400">
          Snelle controle van de live-omgeving en de Supabase-verbinding.
        </p>

        <ul className="mt-8 space-y-3">
          {checks.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3"
            >
              <span className="text-sm text-neutral-300">{c.label}</span>
              <span className="text-sm font-medium">{c.value}</span>
            </li>
          ))}
        </ul>

        {supabaseDetail && (
          <p className="mt-4 rounded-lg bg-neutral-900 px-4 py-3 text-xs text-neutral-500">
            Detail: {supabaseDetail}
          </p>
        )}

        <a
          href="/"
          className="mt-8 inline-block rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800"
        >
          ← Terug naar tools
        </a>
      </div>
    </main>
  );
}
