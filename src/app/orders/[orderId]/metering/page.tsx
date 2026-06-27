"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function MeteringSimulationPage() {
  const router = useRouter();

  // 1. Simulation Inputs (State)
  const [operatingMode, setOperatingMode] = useState<"surplus" | "full">(
    "surplus",
  );
  const [solarSizeKw, setSolarSizeKw] = useState<number>(10);
  const [annualConsumption, setAnnualConsumption] = useState<number>(4000);

  // 2. Mock Constant Market Values
  const GRID_PRICE_PER_KWH = 0.35; // What the user pays the utility
  const FEED_IN_TARIFF_FULL = 0.13; // Higher legal rate for full export
  const FEED_IN_TARIFF_SURPLUS = 0.08; // Standard rate for surplus export

  // 3. Dynamic Calculation Rules (Faked for the Hackathon Demo)
  const annualGeneration = solarSizeKw * 1000; // General rule of thumb: 1kWp = 1000kWh/year

  // Estimate that in surplus mode, a home naturally self-consumes roughly 30% of what they generate
  const simulatedSelfConsumption = Math.min(
    annualGeneration * 0.3,
    annualConsumption,
  );
  const simulatedSurplusExport = Math.max(
    annualGeneration - simulatedSelfConsumption,
    0,
  );
  const simulatedGridImportNeeded = Math.max(
    annualConsumption - simulatedSelfConsumption,
    0,
  );

  // Financial Outcomes
  const normalCostWithoutSolar = annualConsumption * GRID_PRICE_PER_KWH;

  const fullFeedInSolarEarnings = annualGeneration * FEED_IN_TARIFF_FULL;
  const fullFeedInGridCost = annualConsumption * GRID_PRICE_PER_KWH;
  const fullFeedInNetBalance = fullFeedInSolarEarnings - fullFeedInGridCost;

  const surplusSavedMoney = simulatedSelfConsumption * GRID_PRICE_PER_KWH;
  const surplusExportEarnings = simulatedSurplusExport * FEED_IN_TARIFF_SURPLUS;
  const surplusGridCost = simulatedGridImportNeeded * GRID_PRICE_PER_KWH;
  const surplusNetBalance =
    surplusSavedMoney + surplusExportEarnings - normalCostWithoutSolar;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 font-sans text-slate-900 antialiased">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-start px-4 pt-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
        >
          ← Go Back
        </button>
      </nav>
      {/* Main Workspace Frame */}
      <main className="mx-auto grid w-full max-w-7xl flex-grow grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* LEFT COLUMN: Input Strategy Configurator Dashboard (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div>
              <span className="block text-[10px] font-bold tracking-widest text-blue-600 uppercase">
                Step 1
              </span>
              <h1 className="mt-0.5 text-xl font-extrabold text-slate-900">
                Operating Mode Formula
              </h1>
              <p className="mt-1 text-xs leading-normal text-slate-400">
                How will the energy paths flow? This input explicitly dictates
                backend validation parameters for Datenset Field ID{" "}
                <span className="rounded bg-slate-100 px-1 font-mono font-bold text-slate-700">
                  3001
                </span>
                .
              </p>
            </div>

            {/* Selector Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setOperatingMode("surplus")}
                className={`block cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  operatingMode === "surplus"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="mb-1 text-xl">🏡</div>
                <span className="block text-xs font-bold text-slate-900">
                  Surplus Feed-In
                </span>
                <span className="mt-0.5 block text-[11px] leading-tight text-slate-400">
                  Überschusseinspeisung
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOperatingMode("full")}
                className={`block cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  operatingMode === "full"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="mb-1 text-xl">🏦</div>
                <span className="block text-xs font-bold text-slate-900">
                  Full Grid Feed-In
                </span>
                <span className="mt-0.5 block text-[11px] leading-tight text-slate-400">
                  Volleinspeisung
                </span>
              </button>
            </div>

            {/* Slider 1: Solar Power Array Size */}
            <div className="space-y-2 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-600">
                  Planned PV Array Size
                </label>
                <span className="rounded border bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                  {solarSizeKw} kWp (~{annualGeneration.toLocaleString()}{" "}
                  kWh/yr)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={solarSizeKw}
                onChange={(e) => setSolarSizeKw(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />
            </div>

            {/* Slider 2: Household Consumption */}
            <div className="space-y-2 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-600">
                  Annual Home Consumption
                </label>
                <span className="rounded border bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                  {annualConsumption.toLocaleString()} kWh/year
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="8000"
                step="500"
                value={annualConsumption}
                onChange={(e) => setAnnualConsumption(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />
            </div>
          </div>

          {/* Value Pitch Banner */}
          <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
            <span className="block flex items-center gap-1.5 text-xs font-bold">
              🚀 Hackathon Business Impact
            </span>
            <p className="text-[11px] leading-relaxed text-blue-900/80">
              By giving installers and grid operators immediate sight over the
              connection strategy formula, we bypass weeks of administrative
              backlog. Clear parameters ensure error-free automated billing
              registration setup from day one.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: The Visual Financial Formula Outcome Canvas (7 Cols) */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-7">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-sm font-bold tracking-wide text-slate-400 uppercase">
                  2. Live Compensation Preview
                </h2>
                <span className="mt-0.5 block font-mono text-[10px] font-bold text-slate-400">
                  Calculated Utility Accounting Logic
                </span>
              </div>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                Formula Active
              </span>
            </div>

            {/* IF OPERATING MODE IS SURPLUS FEED-IN */}
            {operatingMode === "surplus" && (
              <div className="space-y-4">
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                    <span>🔄</span> Bidirectional Meter Billing Model
                    (Zweirichtungszähler)
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Solar energy runs locally into your outlets first. Leftovers
                    flow outwards through a single bidirectional grid module
                    tracking both flow pathways.
                  </p>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Self-Consumed
                    </span>
                    <span className="mt-1 block font-mono text-sm font-black text-slate-800">
                      {simulatedSelfConsumption.toLocaleString()} kWh
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-emerald-600">
                      +{Math.round(surplusSavedMoney)}€ Saved
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Surplus Exported
                    </span>
                    <span className="mt-1 block font-mono text-sm font-black text-slate-800">
                      {simulatedSurplusExport.toLocaleString()} kWh
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-blue-600">
                      +{Math.round(surplusExportEarnings)}€ Earned
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Grid Buy Needed
                    </span>
                    <span className="mt-1 block font-mono text-sm font-black text-slate-800">
                      {simulatedGridImportNeeded.toLocaleString()} kWh
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-red-500">
                      -{Math.round(surplusGridCost)}€ Cost
                    </span>
                  </div>
                </div>

                {/* Net Statement Box */}
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div>
                    <span className="block text-xs font-bold text-emerald-900">
                      Net System Value Benefit
                    </span>
                    <span className="block text-[11px] leading-tight text-emerald-700">
                      Combined returns vs normal baseline grid expenditure
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-xl font-black ${surplusNetBalance >= 0 ? "text-emerald-600" : "text-slate-700"}`}
                    >
                      {surplusNetBalance >= 0 ? "+" : ""}
                      {Math.round(surplusNetBalance)}€{" "}
                      <span className="text-xs">/ year</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* IF OPERATING MODE IS FULL FEED-IN */}
            {operatingMode === "full" && (
              <div className="space-y-4">
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                    <span>📊</span> Dual-Meter Grid Isolation Model
                    (Volleinspeisung)
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Household paths and generation paths are explicitly split.
                    100% of generated green energy escapes out into the main
                    public line grid infrastructure directly.
                  </p>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      100% Export Revenue
                    </span>
                    <span className="mt-1 block font-mono text-base font-black text-slate-800">
                      {annualGeneration.toLocaleString()} kWh
                    </span>
                    <span className="mt-0.5 block text-xs font-bold text-blue-600">
                      +{Math.round(fullFeedInSolarEarnings)}€ Utility Pays You
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Standard Household Import
                    </span>
                    <span className="mt-1 block font-mono text-base font-black text-slate-800">
                      {annualConsumption.toLocaleString()} kWh
                    </span>
                    <span className="mt-0.5 block text-xs font-bold text-red-500">
                      -{Math.round(fullFeedInGridCost)}€ You Pay Utility
                    </span>
                  </div>
                </div>

                {/* Net Statement Box */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">
                      Net Yearly Statement Balance
                    </span>
                    <span className="block text-[11px] leading-tight text-slate-400">
                      Final financial posture after balancing separate lines
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-xl font-black ${fullFeedInNetBalance >= 0 ? "text-emerald-600" : "text-slate-800"}`}
                    >
                      {fullFeedInNetBalance >= 0 ? "+" : ""}
                      {Math.round(fullFeedInNetBalance)}€{" "}
                      <span className="text-xs">/ year</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Automatic Metadata Generator Alert Callout */}
            <div className="space-y-1 rounded-xl border bg-slate-50 p-3 text-[11px] text-slate-500">
              <span className="block flex items-center gap-1 font-bold text-slate-700">
                📄 VDE Datenset Auto-Registry Hook
              </span>
              <p className="leading-normal">
                Applying this configuration auto-assigns the value token{" "}
                <code className="rounded bg-slate-200 px-1 font-mono font-bold text-slate-800">
                  "
                  {operatingMode === "surplus"
                    ? "Überschusseinspeisung"
                    : "Volleinspeisung"}
                  "
                </code>{" "}
                straight into your main Excel JSON structure schema registry.
              </p>
            </div>
          </div>

          {/* Action Submission Footer */}
          <div className="flex justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() =>
                alert(
                  `Locked strategy choice: '${operatingMode === "surplus" ? "Überschusseinspeisung" : "Volleinspeisung"}' is successfully mapped to grid order connection record.`,
                )
              }
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-blue-700 sm:w-auto"
            >
              Lock Operating Mode Parameter
            </button>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-[11px] text-slate-400 shadow-inner">
        connect-now interface engine • Simulating standardized billing
        parameters cleanly
      </footer>
    </div>
  );
}
