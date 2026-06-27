"use client";

import { useAuth } from "~/app/_context/AuthContext";
import { useState, useTransition } from "react";
import Link from "next/link";

export default function AccountPage() {
  const { user, register } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "member");
  
  // Role specific states
  const [iban, setIban] = useState("DE89 3704 0044 0532 9942 00");
  const [license, setLicense] = useState("VDE-AR-2026-9842");
  const [radius, setRadius] = useState("25 km");
  const [vnbName, setVnbName] = useState("Mitnetz Strom GmbH");
  const [vnbZone, setVnbZone] = useState("Zone Ost-Mitte");

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      // Simulating save
      await new Promise((r) => setTimeout(r, 800));
      // Re-save in AuthContext via mock register call to update state
      await register(firstName, lastName, email, role);
      setMessage("✓ Your settings have been saved successfully.");
    });
  };

  const getRoleLabel = (r?: string) => {
    if (r === "admin") return "Grid Operator Administrator";
    if (r === "installer") return "Certified Contractor (Installer)";
    return "Customer / System Operator";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Header Block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            User Account · Profile
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your personal login details and certification data.
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-pulse">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: General Settings */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              General Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                System role
              </label>
              <input
                type="text"
                disabled
                value={getRoleLabel(user?.role)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* Right: Role-specific details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Role Certificates
            </h2>

            {role === "member" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Payout Account (IBAN)
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Feed-in tariff credits are transferred to this account.
                  </p>
                </div>
              </div>
            )}

            {role === "installer" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    License Number (VDE Registration)
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Service Radius
                  </label>
                  <input
                    type="text"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 leading-normal">
                  ✓ Partner status active. You are listed as a certified specialist partner.
                </div>
              </div>
            )}

            {role === "admin" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Grid Operator Organization
                  </label>
                  <input
                    type="text"
                    value={vnbName}
                    onChange={(e) => setVnbName(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Grid Zone
                  </label>
                  <input
                    type="text"
                    value={vnbZone}
                    onChange={(e) => setVnbZone(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 leading-normal">
                  🛡️ Administrator permissions. You can view all grid connection applications.
                </div>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
