"use client";

import { use, useState } from "react";
import Link from "next/link";
import BackButton from "~/app/_components/BackButton";
import {
  useProjects,
  type DocumentItem,
} from "~/app/_context/ProjectContext";

type CheckState = "pass" | "warn" | "fail";
type Phase = "idle" | "analyzing" | "done";

interface VerificationCheck {
  id: string;
  label: string;
  description: string;
  state: CheckState;
}

interface DocType {
  docId: string; // matches the document id in ProjectContext
  title: string;
  subtitle: string;
  icon: string;
  accept: string;
  analysisSteps: string[];
  criteria: { id: string; label: string; description: string }[];
}

// Visual meta for each AI check verdict — same styling language as the status page
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

// Status badge for the document's overall state in the order
const docStatusMeta: Record<
  DocumentItem["status"],
  { label: string; className: string; icon: string }
> = {
  complete: {
    label: "Complete",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✓",
  },
  review: {
    label: "In review",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "⏳",
  },
  missing: {
    label: "Missing",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "!",
  },
};

// The three documents that can be uploaded & AI-verified here.
const DOCUMENTS: DocType[] = [
  {
    docId: "e8",
    title: "Inverter data sheet (E.8)",
    subtitle: "Manufacturer data sheet of the inverter as required for form E.8.",
    icon: "📄",
    accept: "image/*,application/pdf",
    analysisSteps: [
      "Uploading data sheet…",
      "Extracting device parameters…",
      "Matching certificate references…",
      "Checking E.8 requirements…",
      "Scoring completeness…",
    ],
    criteria: [
      {
        id: "manufacturer",
        label: "Manufacturer & model identifiable",
        description: "Brand and exact type designation are stated.",
      },
      {
        id: "power",
        label: "Rated apparent power (kVA) stated",
        description: "The maximum apparent power value is readable.",
      },
      {
        id: "certificate",
        label: "Unit certificate reference present",
        description: "A certificate number / reference is included.",
      },
      {
        id: "vde",
        label: "VDE-AR-N 4105 conformity",
        description: "Conformity with the relevant grid standard is indicated.",
      },
      {
        id: "legibility",
        label: "Document quality sufficient",
        description: "Resolution and contrast allow automated reading.",
      },
    ],
  },
  {
    docId: "lageplan",
    title: "Site plan / single-line diagram",
    subtitle: "Site plan (Lageplan) and single-line diagram of the installation.",
    icon: "📐",
    accept: "image/*,application/pdf",
    analysisSteps: [
      "Uploading site plan…",
      "Running OCR & line detection…",
      "Matching parcel geometry…",
      "Cross-checking connection requirements…",
      "Scoring completeness…",
    ],
    criteria: [
      {
        id: "boundary",
        label: "Property boundary & footprint visible",
        description: "Parcel outline and building footprint are clearly drawn.",
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
        id: "elements",
        label: "Generation elements shown",
        description: "Inverter, meter and NA-Schutz appear in the diagram.",
      },
      {
        id: "legibility",
        label: "Image quality sufficient",
        description: "Resolution and contrast allow automated reading.",
      },
    ],
  },
  {
    docId: "vollmacht",
    title: "Power of attorney of the system operator",
    subtitle: "Authorization allowing the installer to act on the operator's behalf.",
    icon: "📝",
    accept: "image/*,application/pdf",
    analysisSteps: [
      "Uploading document…",
      "Detecting signatory fields…",
      "Verifying signature & date…",
      "Checking scope of authorization…",
      "Scoring completeness…",
    ],
    criteria: [
      {
        id: "operator",
        label: "System operator named",
        description: "The grantor (system operator) is clearly identified.",
      },
      {
        id: "representative",
        label: "Authorized representative named",
        description: "The party being authorized is stated.",
      },
      {
        id: "signature",
        label: "Signature present",
        description: "A handwritten or qualified electronic signature is detected.",
      },
      {
        id: "date",
        label: "Date present",
        description: "The document carries a valid date.",
      },
      {
        id: "scope",
        label: "Scope of authorization clear",
        description: "The authorization covers the grid connection process.",
      },
    ],
  },
];

export default function DocumentsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { orders, updateOrderDocumentStatus } = useProjects();
  const order = orders.find((o) => o.id === orderId);

  const completeCount = order
    ? DOCUMENTS.filter(
        (d) =>
          order.documents.find((od) => od.id === d.docId)?.status === "complete",
      ).length
    : 0;

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
              Documents · AI Verification
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Upload &amp; verify your documents
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order ID:{" "}
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                {orderId}
              </span>
            </p>
          </header>

          <div className="mt-6 flex flex-col gap-4 rounded-xl bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="text-xl">🤖</span>
              <div className="text-sm">
                <p className="font-semibold text-slate-800">
                  Automated document check
                </p>
                <p className="mt-0.5 text-slate-500">
                  Upload each document below. Our AI assistant checks it against
                  the grid operator&apos;s requirements before submission.{" "}
                  <span className="font-medium text-blue-600">
                    Prototype — analysis is simulated.
                  </span>
                </p>
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-3xl font-extrabold text-blue-600">
                {completeCount}/{DOCUMENTS.length}
              </div>
              <p className="text-[11px] font-medium text-slate-400">verified</p>
            </div>
          </div>
        </div>

        {/* One card per document */}
        {DOCUMENTS.map((doc) => (
          <DocumentCard
            key={doc.docId}
            doc={doc}
            status={
              order?.documents.find((od) => od.id === doc.docId)?.status ??
              "missing"
            }
            onVerified={() =>
              updateOrderDocumentStatus(orderId, doc.docId, "complete")
            }
          />
        ))}

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

function DocumentCard({
  doc,
  status,
  onVerified,
}: {
  doc: DocType;
  status: DocumentItem["status"];
  onVerified: () => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [confidence, setConfidence] = useState(0);

  const statusBadge = docStatusMeta[status];

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setPhase("idle");
    setChecks([]);
    setConfidence(0);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const runVerification = () => {
    if (!fileName) return;
    setPhase("analyzing");
    setActiveStep(0);
    setChecks([]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < doc.analysisSteps.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);

        // Derive pseudo-results from the file name so the demo feels responsive yet stable
        const seed = fileName
          .split("")
          .reduce((acc, c) => acc + c.charCodeAt(0), 0);

        const results: VerificationCheck[] = doc.criteria.map((c, i) => {
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
        if (results.every((r) => r.state !== "fail")) onVerified();
      }
    }, 600);
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-slate-100 p-2 text-2xl">{doc.icon}</span>
          <div>
            <h2 className="text-base font-bold text-slate-800">{doc.title}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{doc.subtitle}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusBadge.className}`}
        >
          <span>{statusBadge.icon}</span>
          {statusBadge.label}
        </span>
      </div>

      {/* Upload area */}
      <div className="pt-5">
        {!fileName ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
            <span className="text-2xl">⬆️</span>
            <span className="text-sm font-semibold text-slate-700">
              Click to select a file
            </span>
            <span className="text-xs text-slate-400">PNG, JPG or PDF</span>
            <input
              type="file"
              accept={doc.accept}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:w-40">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={`${doc.title} preview`}
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
      </div>

      {/* Analysis progress */}
      {phase === "analyzing" && (
        <ol className="mt-5 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          {doc.analysisSteps.map((label, i) => {
            const state =
              i < activeStep ? "done" : i === activeStep ? "current" : "pending";
            return (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
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
      )}

      {/* Results */}
      {phase === "done" && (
        <div className="mt-5">
          {/* Verdict banner */}
          <div
            className={`mb-4 flex items-center justify-between gap-4 rounded-xl p-4 ${
              overallOk ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{overallOk ? "✅" : "⚠️"}</span>
              <p
                className={`text-sm font-bold ${
                  overallOk ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {overallOk
                  ? "Document accepted"
                  : "Needs attention"}
                <span className="ml-1 font-normal">
                  · {passed}/{checks.length} checks passed
                  {failed > 0 && ` · ${failed} to correct`}
                </span>
              </p>
            </div>
            <div className="shrink-0 text-center">
              <div
                className={`text-2xl font-extrabold ${
                  overallOk ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {confidence}%
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                confidence
              </p>
            </div>
          </div>

          {/* Per-check list */}
          <ul className="space-y-2">
            {checks.map((check) => {
              const meta = checkMeta[check.state];
              return (
                <li
                  key={check.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-3"
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

          {overallOk && (
            <p className="mt-3 text-xs font-medium text-emerald-600">
              ✓ Marked as complete in your order.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
