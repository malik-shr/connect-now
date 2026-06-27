"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAuth } from "~/app/_context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const success = await register(firstName, lastName, email, role);
        if (success) {
          router.push("/orders");
        } else {
          setError("An error occurred during registration.");
        }
      } catch (err) {
        setError("An error occurred during registration.");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 pt-24">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Register</h1>
          <p className="mt-2 text-sm text-slate-500">Create your ConnectNow account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Max"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Smith"
              />
            </div>
          </div>

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
              placeholder="max@example.com"
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

          <div>
            <label htmlFor="role" className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="member">System Operator (Customer)</option>
              <option value="installer">Installer (Certified Contractor)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs">
          <p className="text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
