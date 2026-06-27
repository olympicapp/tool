"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string | null; status: string };

export default function SecurityPage() {
  const supabase = createClient();

  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function startEnroll() {
    setError(null);
    setMsg(null);
    const { data, error: e } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    if (e) {
      setError(e.message);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    const { error: ve } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (ve) {
      setError(ve.message);
      return;
    }
    setQr(null);
    setSecret(null);
    setFactorId(null);
    setCode("");
    setMsg("2FA is ingeschakeld ✅");
    load();
  }

  async function removeFactor(id: string) {
    setError(null);
    const { error: e } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (e) {
      setError(e.message);
      return;
    }
    setMsg("2FA uitgeschakeld.");
    load();
  }

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-xl px-6 py-12">
        <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-100">
          ← Terug
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Beveiliging · 2FA</h1>
        <p className="mt-2 text-neutral-400">
          Beveilig je account met een authenticator-app (Google Authenticator,
          Microsoft Authenticator, 1Password, enz.).
        </p>

        {verified.length > 0 && (
          <div className="mt-6 rounded-xl border border-emerald-700/40 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-300">✅ 2FA staat aan.</p>
            {verified.map((f) => (
              <div
                key={f.id}
                className="mt-2 flex items-center justify-between text-sm"
              >
                <span className="text-neutral-300">
                  {f.friendly_name || "Authenticator"}
                </span>
                <button
                  onClick={() => removeFactor(f.id)}
                  className="text-red-400 hover:underline"
                >
                  Verwijderen
                </button>
              </div>
            ))}
          </div>
        )}

        {!qr && verified.length === 0 && (
          <button
            onClick={startEnroll}
            className="mt-6 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-neutral-950 transition hover:bg-cyan-400"
          >
            2FA inschakelen
          </button>
        )}

        {qr && (
          <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
            <p className="text-sm text-neutral-400">
              1. Scan deze QR-code met je authenticator-app:
            </p>
            <div
              className="mt-3 inline-block rounded-lg bg-white p-3"
              // Supabase levert de QR als SVG-string aan.
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            {secret && (
              <p className="mt-3 break-all text-xs text-neutral-500">
                Of voer handmatig in: <span className="text-neutral-300">{secret}</span>
              </p>
            )}
            <form onSubmit={confirmEnroll} className="mt-4 space-y-3">
              <p className="text-sm text-neutral-400">
                2. Voer de 6-cijferige code in ter bevestiging:
              </p>
              <input
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-cyan-500"
              />
              <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-neutral-950 transition hover:bg-cyan-400">
                Bevestigen
              </button>
            </form>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        {msg && <p className="mt-4 text-sm text-emerald-400">{msg}</p>}
      </div>
    </main>
  );
}
