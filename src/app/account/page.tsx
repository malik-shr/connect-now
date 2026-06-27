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
      setMessage("✓ Ihre Einstellungen wurden erfolgreich gespeichert.");
    });
  };

  const getRoleLabel = (r?: string) => {
    if (r === "admin") return "VNB Administrator (Netzbetreiber)";
    if (r === "installer") return "Zertifizierter Fachbetrieb (Installateur)";
    return "Kunde / Anlagenbetreiber";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Header Block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            Benutzerkonto · Profil
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Mein Profil
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Verwalten Sie Ihre persönlichen Anmeldeinformationen und Zertifikatsdaten.
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
              Allgemeine Angaben
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Vorname
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
                  Nachname
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
                E-Mail-Adresse
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
                Systemrolle
              </label>
              <input
                type="text"
                disabled
                value={getRoleLabel(user?.role)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>

            {/* Speichern Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Speichere..." : "Änderungen speichern"}
              </button>
            </div>
          </div>

          {/* Right: Role-specific details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Rollen-Zertifikate
            </h2>

            {role === "member" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Auszahlungskonto (IBAN)
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Gutschriften der Einspeisevergütung werden an dieses Konto überwiesen.
                  </p>
                </div>
              </div>
            )}

            {role === "installer" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Konzessionsnummer (VDE-Eintrag)
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
                    Aktionsradius
                  </label>
                  <input
                    type="text"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 leading-normal">
                  ✓ Partner-Status aktiv. Sie sind als zertifizierter Fachpartner gelistet.
                </div>
              </div>
            )}

            {role === "admin" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    VNB Organisation
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
                    Netzzone
                  </label>
                  <input
                    type="text"
                    value={vnbZone}
                    onChange={(e) => setVnbZone(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800 leading-normal">
                  🛡️ Administrator-Berechtigungen. Sie können alle Netzanschluss-Anträge einsehen.
                </div>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
