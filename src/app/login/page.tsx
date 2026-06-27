"use client";

import Link from "next/link";
import { useState, useTransition, Suspense } from "react";
import { useAuth } from "~/app/_context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/orders";

  const [email, setEmail] = useState("install@connect-now.io");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const success = await login(email);
        if (success) {
          router.push(redirectUrl);
        } else {
          setError("Ungültige Anmeldedaten.");
        }
      } catch (err) {
        setError("Fehler bei der Anmeldung.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 pt-32">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Anmelden</h1>
          <p className="mt-2 text-sm text-slate-500">Loggen Sie sich in Ihr ConnectNow-Konto ein</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          {/* Hackathon help callout */}
          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 border border-blue-100 leading-normal">
            💡 <strong>Hackathon Demo-Modus:</strong> Sie können jede beliebige E-Mail/Passwort-Kombination eingeben. Nutzen Sie z.B. <code>install@connect-now.io</code> für Installateur-Rechte.
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            >
              {isPending ? "Melde an..." : "Anmelden"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs">
          <p className="text-slate-500">
            Noch kein Konto?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Lade...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
