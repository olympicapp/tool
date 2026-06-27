"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Heeft deze gebruiker 2FA? Dan een extra stap.
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
        setNeedsMfa(true);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setLoading(true);

    const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (mfaError) {
      setError(mfaError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          Olympic Hotel
        </p>
        <h1 className="mt-2 text-2xl font-bold">Inloggen</h1>

        {!needsMfa ? (
          <form onSubmit={handlePassword} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-neutral-400">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">
                Wachtwoord
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-cyan-500"
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-neutral-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Bezig…" : "Inloggen"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfa} className="mt-8 space-y-4">
            <p className="text-sm text-neutral-400">
              Voer de 6-cijferige code uit je authenticator-app in.
            </p>
            <input
              inputMode="numeric"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-lg tracking-widest outline-none focus:border-cyan-500"
            />
            <button
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-medium text-neutral-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Bezig…" : "Bevestig code"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
