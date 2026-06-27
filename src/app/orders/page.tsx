"use client";

import Link from "next/link";
import { useProjects } from "~/app/_context/ProjectContext";
import { useAuth } from "~/app/_context/AuthContext";

const STATUS_STYLE = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function OrdersPage() {
  const { orders } = useProjects();
  const { user } = useAuth();

  const filteredOrders = orders.filter((o) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "installer") {
      return o.assignedInstallerId === user.installerId;
    }
    return o.ownerEmail === user.email;
  });

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
              My Projects
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              All grid connection requests at a glance.
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

        {/* Order cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  ☀️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-800 group-hover:text-blue-700">
                      {order.asset}
                    </h2>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-500">
                      #{order.id}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {order.power} · last updated {order.updated}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLE[order.status]}`}
                >
                  {order.status}
                </span>
                <span className="text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty-state hint */}
        <p className="pt-2 text-center text-xs text-slate-400">
          Sandbox Data · Projects are saved locally in the browser storage (localStorage).
        </p>
      </div>
    </div>
  );
}
