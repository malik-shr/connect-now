"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";

// Define our strict technical node property types
interface ElectricalNode {
  id: string;
  type: "grid" | "meter" | "eza" | "load" | "protection";
  label: string;
  technicalCode: string;
  icon: string;
  details: string;
}

export default function TechnicalConstructorPage() {
  const router = useRouter();
  const { orderId } = useParams();

  // 1. Initial baseline configuration sequence mirroring standard connection limits
  const [nodes, setNodes] = useState<ElectricalNode[]>([
    {
      id: "n-1",
      type: "grid",
      label: "Public Utility Grid",
      technicalCode: "DSO low voltage",
      icon: "🌐",
      details: "400V / 230V Mains Connection Point",
    },
    {
      id: "n-2",
      type: "meter",
      label: "Main Bidirectional Meter",
      technicalCode: "Meter 1 (bidirectional)",
      icon: "📟",
      details: "Tracks Import (1.8.0) & Export (2.8.0)",
    },
    {
      id: "n-3",
      type: "load",
      label: "Household Consumer Loads",
      technicalCode: "Customer system consumption",
      icon: "🏡",
      details: "Standard fuse-box distribution path",
    },
    {
      id: "n-4",
      type: "eza",
      label: "PV Inverter System (EZA)",
      technicalCode: "Inverter",
      icon: "☀️",
      details: "Generates AC feed-in synchronization line",
    },
  ]);

  // 2. Pool of addable nodes a user can inject to create a custom "metering concept"
  const TOOLBOX_ITEMS = [
    {
      type: "meter",
      label: "Generation Sub-Meter",
      technicalCode: "Meter 2 (generation)",
      icon: "📟",
      details: "Required for separate feed-in accounting",
    },
    {
      type: "protection",
      label: "Central Grid & Plant Protection",
      technicalCode: "NA-Schutz (central)",
      icon: "🛡️",
      details: "VDE-AR-N 4105 safety disconnect element",
    },
    {
      type: "load",
      label: "Controllable Load (Heat Pump)",
      technicalCode: "Load §14a EnWG",
      icon: "♨️",
      details: "Dimmer utility load optimization line",
    },
    {
      type: "load",
      label: "EV Wallbox Charger Station",
      technicalCode: "Charging station",
      icon: "🔌",
      details: "High-power infrastructure terminal link",
    },
  ];

  // Handler to inject a new component block node directly into the system circuit
  const handleAddNode = (item: (typeof TOOLBOX_ITEMS)[0]) => {
    const newNode: ElectricalNode = {
      id: `n-${Date.now()}`,
      type: item.type as any,
      label: item.label,
      technicalCode: item.technicalCode,
      icon: item.icon,
      details: item.details,
    };

    // Insert structural nodes gracefully right before the final PV generation plant node element
    const updated = [...nodes];
    if (updated.length > 1) {
      updated.splice(updated.length - 1, 0, newNode);
    } else {
      updated.push(newNode);
    }
    setNodes(updated);
  };

  // Handler to delete custom added items out of our network line scheme track
  const handleRemoveNode = (id: string, label: string) => {
    if (
      label === "Public Utility Grid" ||
      label === "PV Inverter System (EZA)"
    ) {
      alert(
        "Core boundaries ('Public Utility Grid' and the primary 'EZA Production Line') are strictly required for line-routing evaluations.",
      );
      return;
    }
    setNodes(nodes.filter((n) => n.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Header Bar Layout */}
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          ← Go Back
        </button>
      </nav>

      {/* Main Framework Dashboard Workspace */}
      <main className="mx-auto grid w-full max-w-7xl flex-grow grid-cols-1 gap-8 px-4 pt-4 pb-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* LEFT COLUMN: Technical Node Components Toolbox (4 Cols) */}
        <div className="space-y-5 lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div>
              <span className="block text-[10px] font-bold tracking-widest text-blue-600 uppercase">
                Circuit Components
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Technical Node Toolbox
              </h2>
              <p className="mt-1 text-xs leading-normal text-slate-400">
                Click a hardware item below to dynamically splice it into your
                single-line diagram track structure.
              </p>
            </div>

            <div className="space-y-2">
              {TOOLBOX_ITEMS.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAddNode(item)}
                  className="group flex w-full cursor-pointer items-start space-x-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/30"
                >
                  <span className="rounded-lg bg-slate-100 p-1.5 text-xl transition-colors group-hover:bg-blue-100">
                    {item.icon}
                  </span>
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-slate-800">
                      {item.label}
                    </span>
                    <span className="block font-mono text-[10px] text-slate-400">
                      {item.technicalCode}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* VDE Form Metadata Coupling Indicator Alert */}
          <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
            <span className="block flex items-center gap-1 font-bold">
              📄 Single-Line Auto Verification (ID: 2006)
            </span>
            <p className="text-[11px] leading-relaxed text-blue-900/80">
              This constructor dynamically logs structural system chains to
              compile the required Single-Line Diagram data block. Grid
              engineers evaluate this blueprint tracking configuration layout
              straight upon submission.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: The Interactive Single-Line Bus-Bar Trace Window (8 Cols) */}
        <div className="flex min-h-[480px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Custom Single-Line Diagram Grid Trace
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Physical Line Flow Sequence Mapped From Main Mains Inward
                  Point
                </p>
              </div>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-700 uppercase">
                Blueprint Output Stable
              </span>
            </div>

            {/* THE VISUAL SCHEMATIC TRACK */}
            <div className="flex min-h-[160px] flex-col items-center justify-center space-y-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-6">
                {nodes.map((node, index) => {
                  const isCoreBoundary =
                    node.label === "Public Utility Grid" ||
                    node.label === "PV Inverter System (EZA)";
                  return (
                    <div
                      key={node.id}
                      className="group flex items-center gap-2"
                    >
                      {/* Technical Circuit Node Element Card */}
                      <div
                        className={`relative flex w-36 flex-col items-center justify-center rounded-xl border bg-white p-3.5 text-center shadow-sm transition-all ${
                          isCoreBoundary
                            ? "border-slate-800 ring-2 ring-slate-900/5"
                            : "border-blue-300 ring-1 ring-blue-100"
                        }`}
                      >
                        <span className="mb-1 text-2xl">{node.icon}</span>
                        <span className="block w-full truncate text-[11px] leading-tight font-extrabold text-slate-800">
                          {node.label}
                        </span>
                        <span className="mt-0.5 block w-full truncate font-mono text-[9px] text-slate-400">
                          {node.technicalCode}
                        </span>

                        {/* Interactive Removal Trigger Node Hook */}
                        {!isCoreBoundary && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveNode(node.id, node.label)
                            }
                            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-red-500 font-sans text-[9px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                            title="Remove connection node"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Line-Routing Trace Arrow Indicator element */}
                      {index < nodes.length - 1 && (
                        <div className="flex flex-col items-center px-1 text-xs font-bold tracking-tighter text-slate-300 select-none">
                          <span>🔌</span>
                          <span className="text-blue-500">➔</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Machine Dataset Structure Preview Console Block */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Compiled Single-Line Topology Array JSON Data (Field ID 2006)
              </span>
              <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-emerald-400 shadow-inner">
                {JSON.stringify(
                  {
                    orderId: orderId,
                    technicalSchemaKey: "2006_EINPOLIG",
                    hardwareNodeSequence: nodes.map((n, idx) => ({
                      sequenceOrder: idx + 1,
                      deviceType: n.type,
                      deviceRegistrationCode: n.technicalCode,
                    })),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>

          {/* Action Submission Footer */}
          <div className="flex justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() =>
                alert(
                  `Single-line system blueprint array lock confirmed for processing console payload mapping.`,
                )
              }
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-blue-700 sm:w-auto"
            >
              Verify Technical Connection Path Setup
            </button>
          </div>
        </div>
      </main>

      {/* Footer Element */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-[11px] text-slate-400">
        connect-now sandbox line editor • Formulating valid single-line grid
        topologies fluidly
      </footer>
    </div>
  );
}
