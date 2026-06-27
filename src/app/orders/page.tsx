"use client";

import Link from "next/link";
import { useState } from "react";
import { useProjects } from "~/app/_context/ProjectContext";
import { useAuth } from "~/app/_context/AuthContext";

const STATUS_STYLE = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function OrdersPage() {
  const { orders, installers, acceptOffer } = useProjects();
  const { user } = useAuth();

  const [installerTab, setInstallerTab] = useState<"assigned" | "market">("assigned");

  // Get active installer details to verify VNB/EVH certifications
  const activeInstallerRecord = installers.find((i) => i.id === user?.installerId);
  const isCertified = activeInstallerRecord?.certified ?? false;

  const filteredOrders = orders.filter((o) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "installer") {
      if (installerTab === "assigned") {
        return o.assignedInstallerId === user.installerId;
      } else {
        // Open Job Market: unassigned orders
        return o.assignedInstallerId === null;
      }
    }
    return o.ownerEmail === user.email;
  });

  const handleAcceptJob = (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.installerId || !isCertified) return;
    acceptOffer(orderId, user.installerId);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              ConnectNow · Overview
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {user?.role === "installer" ? "Installer Console" : "My Projects"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {user?.role === "installer"
                ? "Manage your active installations or browse open bids in the Halle (Saale) grid area."
                : "All grid connection requests at a glance."
              }
            </p>
          </div>
          {user?.role === "member" && (
            <Link
              href="/register-project"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-blue-700 cursor-pointer"
            >
              + New Project
            </Link>
          )}
        </div>

        {/* Installer Tab switcher */}
        {user?.role === "installer" && (
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
            <button
              onClick={() => setInstallerTab("assigned")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                installerTab === "assigned"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📋 My Assignments ({orders.filter(o => o.assignedInstallerId === user.installerId).length})
            </button>
            <button
              onClick={() => setInstallerTab("market")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                installerTab === "market"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              💼 Open Job Market ({orders.filter(o => o.assignedInstallerId === null).length})
            </button>
          </div>
        )}

        {/* Order cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-500 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                    ☀️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-800">
                        {order.asset}
                      </h2>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-500">
                        #{order.id}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {order.power} · last updated {order.updated}
                    </p>
                    {user?.role === "installer" && installerTab === "market" && (
                      <p className="mt-1 text-xs font-bold text-slate-600">
                        Price Offer: <span className="text-emerald-600 text-sm font-extrabold">{order.priceOffer}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  {user?.role === "installer" && installerTab === "market" ? (
                    <div>
                      {isCertified ? (
                        <button
                          type="button"
                          onClick={(e) => handleAcceptJob(e, order.id)}
                          className="cursor-pointer rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 shadow-xs transition"
                        >
                          Accept Job ➔
                        </button>
                      ) : (
                        <div className="text-right">
                          <button
                            type="button"
                            disabled
                            className="rounded-lg bg-slate-150 text-slate-400 font-bold text-xs px-4 py-2 border border-slate-200 cursor-not-allowed"
                          >
                            Accept Job
                          </button>
                          <span className="block text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">
                            EVH Certification Pending
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLE[order.status]}`}
                      >
                        {order.status}
                      </span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Open →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm font-bold text-slate-500">No projects found</p>
              <p className="text-xs text-slate-400 mt-1">
                {installerTab === "market"
                  ? "There are currently no unassigned solar connection request offers on the market."
                  : "You have not been assigned to any PV connection projects yet."
                }
              </p>
            </div>
          )}
        </div>

        {/* Empty-state hint */}
        <p className="pt-2 text-center text-xs text-slate-400">
          Sandbox Data · Projects are saved locally in the browser storage (localStorage).
        </p>
      </div>
    </div>
  );
}
