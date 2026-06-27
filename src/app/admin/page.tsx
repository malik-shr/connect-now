"use client";

import { useProjects, Order, Installer } from "~/app/_context/ProjectContext";
import { useState } from "react";

export default function AdminPage() {
  const { 
    orders, 
    installers, 
    updateOrderStatus, 
    assignInstaller, 
    updateOrderDocumentStatus,
    approveInstaller,
    rejectInstaller 
  } = useProjects();

  const [activeTab, setActiveTab] = useState<"stats" | "requests" | "installers">("stats");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Statistics calculation
  const totalProjects = orders.length;
  const approvedCount = orders.filter((o) => o.status === "Approved").length;
  const successRate = totalProjects > 0 ? Math.round((approvedCount / totalProjects) * 100) : 100;
  
  const totalPowerKwp = orders.reduce((sum, o) => {
    const val = parseFloat(o.power.replace(",", ".").replace(" kWp", ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Installer matchmaking dropdown handler
  const handleAssignInstaller = (orderId: string, instId: string) => {
    assignInstaller(orderId, instId === "none" ? null : instId);
  };

  // Helper to toggle document validation status
  const handleToggleDoc = (orderId: string, docId: string, current: string) => {
    const nextStatus = current === "complete" ? "review" : current === "review" ? "missing" : "complete";
    updateOrderDocumentStatus(orderId, docId, nextStatus);
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* VNB Admin Portal Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            Grid operator portal · DSO cockpit
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Grid connection approvals & partners
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            System-wide control of connection requests (Data Set 3.0), partner installers and grid capacity data.
          </p>

          {/* Navigation Tab Bar */}
          <div className="mt-6 flex gap-2 border-t border-slate-100 pt-6">
            <button
              onClick={() => setActiveTab("stats")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "stats"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📊 Metrics & utilisation
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📋 Connection requests ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("installers")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "installers"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🔧 Specialist partner approvals
            </button>
          </div>
        </div>

        {/* --- TAB 1: STATISTICS --- */}
        {activeTab === "stats" && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total connection applications</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{totalProjects}</span>
                <span className="text-[10px] text-slate-500 block mt-2">Reporting period: 30 days</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Installed capacity</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{totalPowerKwp.toFixed(1)} kWp</span>
                <span className="text-[10px] text-emerald-600 block mt-2">▲ +14.8% compared to the previous month</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Approval rate (success)</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{successRate}%</span>
                <span className="text-[10px] text-slate-500 block mt-2">{approvedCount} of {totalProjects} approved</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ø Processing time</span>
                <span className="text-3xl font-black text-blue-600 block mt-1">4.2 days</span>
                <span className="text-[10px] text-slate-400 block mt-2">Thanks to the Data Set 3.0 standard</span>
              </div>
            </div>

            {/* Connected Growth Chart (Dynamisch gezeichnet via CSS) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="border-b border-slate-100 pb-3 mb-6">
                <h3 className="text-sm font-bold text-slate-800">Grid feed-in growth (last 5 months)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Newly approved kWp capacity per month.</p>
              </div>

              {/* Flex bar graph */}
              <div className="flex items-end justify-between h-48 px-4 border-b border-slate-200 pb-1">
                {[
                  { month: "Feb", value: 40, label: "22 kWp" },
                  { month: "Mar", value: 65, label: "38 kWp" },
                  { month: "Apr", value: 50, label: "29 kWp" },
                  { month: "May", value: 85, label: "49 kWp" },
                  { month: "Jun", value: 100, label: `${totalPowerKwp.toFixed(0)} kWp` }
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center w-12 sm:w-16 group">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {bar.label}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${bar.value * 1.2}px` }}
                    />
                    <span className="text-xs text-slate-400 font-semibold mt-2">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PROJECTS/REQUESTS --- */}
        {activeTab === "requests" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Left: Orders List (2 Columns) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Open grid requests</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const assigned = installers.find((i) => i.id === order.assignedInstallerId);
                  
                  return (
                    <div 
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition hover:bg-slate-50/50 ${
                        selectedOrderId === order.id ? "bg-blue-50/30 border-l-4 border-blue-600" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">{order.asset}</h4>
                          <span className="font-mono text-xs text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                            #{order.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {order.power} · Last update: {order.updated}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Installer: <span className="font-semibold">{assigned ? `${assigned.name} (${assigned.company})` : "Not assigned"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          order.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.status === "Under review"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-slate-300">➔</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Order Detail / Management Console (1 Column) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg space-y-6 min-h-[400px]">
              {selectedOrder ? (
                <div className="space-y-6">
                  <header className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-base">{selectedOrder.asset}</h3>
                    <p className="font-mono text-xs text-slate-400 mt-0.5">Application number: #{selectedOrder.id}</p>
                  </header>

                  {/* Status update controller */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Change case status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Draft", "Submitted", "Under review", "Approved"] as Order["status"][]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateOrderStatus(selectedOrder.id, s)}
                          className={`rounded px-3 py-1.5 text-xs font-bold text-center border transition-all ${
                            selectedOrder.status === s
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Installer regional assignment selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned specialist company
                    </label>
                    <select
                      value={selectedOrder.assignedInstallerId || "none"}
                      onChange={(e) => handleAssignInstaller(selectedOrder.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="none">-- No installer --</option>
                      {installers.filter(i => i.certified).map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.company}) - Postcode: {inst.region}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Documents checklist details */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Document completeness (click to toggle)
                    </label>
                    <div className="space-y-2">
                      {selectedOrder.documents.map((doc) => (
                        <div 
                          key={doc.id}
                          onClick={() => handleToggleDoc(selectedOrder.id, doc.id, doc.status)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer text-xs transition"
                        >
                          <span className="font-semibold text-slate-700 truncate mr-2">{doc.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            doc.status === "complete"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.status === "review"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                          }`}>
                            {doc.status === "complete" ? "✓ Validated" : doc.status === "review" ? "⏳ Review" : "! Missing"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="text-4xl block mb-2">👈</span>
                  <p className="text-sm font-bold text-slate-400">Please select a connection request</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click a project in the list on the left to process the case.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: INSTALLERS --- */}
        {activeTab === "installers" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden animate-fade-in">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Certified specialist companies & registrations</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 bg-slate-50/30">
                    <th className="p-4">Name / company</th>
                    <th className="p-4">Region (postcode)</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Edit certification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {installers.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/20 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{inst.name}</div>
                        <div className="text-xs text-slate-400">{inst.company}</div>
                      </td>
                      <td className="p-4 font-semibold text-xs text-slate-600">{inst.region}</td>
                      <td className="p-4 text-xs font-bold text-amber-500">{inst.rating}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          inst.certified 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {inst.certified ? "Certified" : "Review pending"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {!inst.certified ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approveInstaller(inst.id)}
                              className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded shadow-sm transition"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectInstaller(inst.id)}
                              className="cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-3 py-1.5 rounded transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => rejectInstaller(inst.id)}
                            className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-3 py-1.5 rounded transition"
                          >
                            Revoke approval
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
