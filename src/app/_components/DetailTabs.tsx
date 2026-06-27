"use client";

import Link from "next/link";
import { useAuth } from "~/app/_context/AuthContext";

export type DetailView = "all" | "customer" | "installer";

// Geteilte Tab-Navigation zwischen den drei Detail-Ansichten.
export default function DetailTabs({
  orderId,
  active,
}: {
  orderId: string;
  active: DetailView;
}) {
  const { user } = useAuth();

  const tabs = [
    { key: "all", label: "Vollständig", href: `/orders/${orderId}/details` },
    user?.role !== "installer" && {
      key: "customer",
      label: "👤 Kunde",
      href: `/orders/${orderId}/details/customer`,
    },
    {
      key: "installer",
      label: "🔧 Installateur",
      href: `/orders/${orderId}/details/installer`,
    },
  ].filter(Boolean) as { key: DetailView; label: string; href: string }[];

  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            t.key === active
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
