"use client";

import Link from "next/link";
import { useState, useTransition, Suspense } from "react";
import { useAuth } from "~/app/_context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

const PERSONAS = [
  {
    email: "user1@connect-now.io",
    name: "Customer 1 (Operator)",
    role: "member",
    desc: "Sees PV-Halle-Nord & Storage (South)",
    icon: "👤",
  },
  {
    email: "user2@connect-now.io",
    name: "Customer 2 (Operator)",
    role: "member",
    desc: "Sees PV+Heat Pump & Primary School",
    icon: "👤",
  },
  {
    email: "install@connect-now.io",
    name: "Max Weber (Installer)",
    role: "installer",
    desc: "Sees assigned projects: Halle-Nord & Heat Pump",
    icon: "🔧",
  },
  {
    email: "installer2@connect-now.io",
    name: "Alex Wagner (Installer)",
    role: "installer",
    desc: "Sees assigned projects: Storage (South)",
    icon: "🔧",
  },
  {
    email: "admin@connect-now.io",
    name: "Dr. Andrea Kraft (Grid Operator Admin)",
    role: "admin",
    desc: "Master operator access. Sees all 4 projects & stats",
    icon: "🛡️",
  },
];

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/orders";

  const [email, setEmail] = useState("install@connect-now.io");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLoginSubmit = (targetEmail: string) => {
    setError("");
    startTransition(async () => {
      try {
        const success = await login(targetEmail);
        if (success) {
          router.push(redirectUrl);
        } else {
          setError("Invalid login credentials.");
        }
      } catch (err) {
        setError("An error occurred during login.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginSubmit(email);
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 pt-16 pb-20">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Persona Quick Selector Widget (7 Columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
              Hackathon Quick-Select
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Test Personas & Data Isolation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Click a role below to log in instantly. Each persona has access to a strictly isolated data area.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PERSONAS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => {
                  setEmail(p.email);
                  handleLoginSubmit(p.email);
                }}
                disabled={isPending}
                className="group flex items-start space-x-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/20 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl rounded-lg bg-slate-50 p-2 group-hover:bg-blue-50 shrink-0">
                  {p.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    {p.name}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                    {p.email}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">
                    {p.desc}
                  </span>
                </div>
                <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-1">
                  Login ➔
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Standard Form (5 Columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-6 text-center border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-black text-slate-900">Log in</h1>
            <p className="text-xs text-slate-500 mt-1">Enter credentials manually</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full cursor-pointer flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              >
                {isPending ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs">
            <p className="text-slate-500">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500">
                Register now
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
