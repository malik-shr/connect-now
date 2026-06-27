"use client";

import { use, useState } from "react";
import Link from "next/link";
import BackButton from "~/app/_components/BackButton";

type CheckState = "pass" | "warn" | "fail";

interface VerificationCheck {
  id: string;
  label: string;
  description: string;
  state: CheckState;
}

type Phase = "idle" | "analyzing" | "done";

// Visual meta for each AI check verdict — mirrors the document status styling used across the app
const checkMeta: Record<
  CheckState,
  { className: string; icon: string; label: string }
> = {
  pass: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✓",
    label: "Passed",
  },
  warn: {
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "!",
    label: "Review",
  },
  fail: {
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "✕",
    label: "Failed",
  },
};

// Prototype: the criteria a grid operator expects on a valid site plan (Lageplan)
const CRITERIA: { id: string; label: string; description: string }[] = [
  {
    id: "boundary",
    label: "Property boundary visible",
    description: "The parcel outline and adjacent plots are clearly delineated.",
  },
  {
    id: "footprint",
    label: "Building footprint marked",
    description: "The main building and outbuildings are drawn to scale.",
  },
  {
    id: "connection",
    label: "Grid connection point located",
    description: "The house connection box / meter position is indicated.",
  },
  {
    id: "scale",
    label: "Scale & north arrow present",
    description: "A legible scale bar and orientation arrow are included.",
  },
  {
    id: "dimensions",
    label: "Distance dimensions provided",
    description: "Setbacks and the route to the connection point are dimensioned.",
  },
  {
    id: "legibility",
    label: "Image quality sufficient",
    description: "Resolution and contrast allow automated reading of the plan.",
  },
];

const ANALYSIS_STEPS = [
  "Uploading site plan…",
  "Running OCR & line detection…",
  "Matching parcel geometry…",
  "Cross-checking grid connection requirements…",
  "Scoring completeness…",
];

export default function SitePlanPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [confidence, setConfidence] = useState(0);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setPhase("idle");
    setChecks([]);
    setConfidence(0);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Prototype AI verification — simulates a staged analysis with deterministic-ish results.
  const runVerification = () => {
    if (!fileName) return;
    setPhase("analyzing");
    setActiveStep(0);
    setChecks([]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < ANALYSIS_STEPS.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);

        // Derive pseudo-results from the file name so the demo feels responsive yet stable
        const seed = fileName
          .split("")
          .reduce((acc, c) => acc + c.charCodeAt(0), 0);

        const results: VerificationCheck[] = CRITERIA.map((c, i) => {
          const roll = (seed + i * 7) % 10;
          const state: CheckState = roll > 7 ? "fail" : roll > 5 ? "warn" : "pass";
          return { ...c, state };
        });

        const score = Math.round(
          (results.filter((r) => r.state === "pass").length / results.length) *
            100,
        );

        setChecks(results);
        setConfidence(score);
        setPhase("done");
      }
    }, 650);
  };

  const reset = () => {
    setFileName(null);
    setPreviewUrl(null);
    setPhase("idle");
    setChecks([]);
    setConfidence(0);
  };

  const passed = checks.filter((c) => c.state === "pass").length;
  const failed = checks.filter((c) => c.state === "fail").length;
  const overallOk = phase === "done" && failed === 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Context Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <header className="border-b border-slate-200 pb-5">
            <div className="mb-4">
              <BackButton href={`/orders/${orderId}`} />
            </div>
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Site Plan · AI Verification
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Upload &amp; verify your site plan
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order ID:{" "}
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                {orderId}
              </span>
            </p>
          </header>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50/60 p-5">
            <span className="text-xl">🤖</span>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">
                Automated completeness check
              </p>
              <p className="mt-0.5 text-slate-500">
                Upload the site plan (Lageplan) for the connection point. Our AI
                assistant checks it against the grid operator&apos;s requirements
                before submission.{" "}
                <span className="font-medium text-blue-600">
                  Prototype — analysis is simulated.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Upload card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <h2 className="mb-1 text-lg font-bold text-slate-800">1 · Upload plan</h2>
          <p className="mb-6 text-sm font-medium text-slate-500">
            Supported formats: PNG, JPG or PDF.
          </p>

          {!fileName ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
              <span className="text-3xl">📐</span>
              <span className="text-sm font-semibold text-slate-700">
                Click to select a file
              </span>
              <span className="text-xs text-slate-400">
                or drag &amp; drop your site plan here
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Preview */}
              <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:w-44">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Site plan preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-4xl">📄</span>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{fileName}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Ready for AI verification.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={runVerification}
                    disabled={phase === "analyzing"}
                    className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {phase === "analyzing"
                      ? "Verifying…"
                      : phase === "done"
                        ? "Re-run verification"
                        : "✨ Verify with AI"}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={phase === "analyzing"}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Analysis progress */}
        {phase === "analyzing" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            <h2 className="mb-6 text-lg font-bold text-slate-800">
              2 · AI analysis running
            </h2>
            <ol className="space-y-3">
              {ANALYSIS_STEPS.map((label, i) => {
                const state =
                  i < activeStep ? "done" : i === activeStep ? "current" : "pending";
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                        state === "done"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : state === "current"
                            ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-500/20"
                            : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {state === "done" ? "✓" : i + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        state === "pending"
                          ? "text-slate-400"
                          : "font-medium text-slate-700"
                      }`}
                    >
                      {label}
                      {state === "current" && (
                        <span className="ml-1 animate-pulse text-blue-500">…</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Results */}
        {phase === "done" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            <h2 className="mb-6 text-lg font-bold text-slate-800">
              2 · Verification result
            </h2>

            {/* Verdict banner */}
            <div
              className={`mb-6 flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between ${
                overallOk ? "bg-emerald-50" : "bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{overallOk ? "✅" : "⚠️"}</span>
                <div>
                  <p
                    className={`text-base font-bold ${
                      overallOk ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {overallOk
                      ? "Site plan looks complete"
                      : "Site plan needs attention"}
                  </p>
                  <p
                    className={`mt-0.5 text-sm ${
                      overallOk ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {passed} of {checks.length} checks passed
                    {failed > 0 && ` · ${failed} require correction`}.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <div
                  className={`text-3xl font-extrabold ${
                    overallOk ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {confidence}%
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  AI confidence
                </p>
              </div>
            </div>

            {/* Per-check list */}
            <ul className="space-y-3">
              {checks.map((check) => {
                const meta = checkMeta[check.state];
                return (
                  <li
                    key={check.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {check.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {check.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}
                    >
                      <span>{meta.icon}</span>
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Action footer */}
            <div className="mt-6 flex flex-col justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Upload a different plan
              </button>
              <button
                type="button"
                disabled={!overallOk}
                onClick={() =>
                  alert("Site plan accepted and attached to the order.")
                }
                className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Accept &amp; attach to order
              </button>
            </div>
          </section>
        )}

        {/* Footer navigation */}
        <div className="flex justify-between">
          <Link
            href={`/orders/${orderId}`}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            ← Back to order
          </Link>
          <Link
            href={`/orders/${orderId}/status`}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View status →
          </Link>
        </div>
      </div>
    </div>
  );
}
