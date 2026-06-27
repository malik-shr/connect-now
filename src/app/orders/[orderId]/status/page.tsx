"use client";

import Link from "next/link";
import { use } from "react";
import { useProjects, Order, DocumentItem } from "~/app/_context/ProjectContext";
import BackButton from "~/app/_components/BackButton";

type StepState = "done" | "current" | "pending";

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  state: StepState;
  date?: string;
  actor: "Customer" | "Installer" | "Grid Operator";
}

// Style helpers
const actorBadge: Record<ProcessStep["actor"], string> = {
  Customer: "bg-emerald-100 text-emerald-700",
  Installer: "bg-amber-100 text-amber-700",
  "Grid Operator": "bg-blue-100 text-blue-700",
};

const docStatusMeta: Record<
  DocumentItem["status"],
  { label: string; className: string; icon: string }
> = {
  complete: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✓",
  },
  review: {
    label: "In Review",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "⏳",
  },
  missing: {
    label: "Missing",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "!",
  },
};

export default function StatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { orders, updateOrderDocumentStatus } = useProjects();

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-slate-500">Project not found.</p>
          <Link href="/orders" className="text-xs text-blue-600 font-bold underline">
            Back to overview
          </Link>
        </div>
      </div>
    );
  }

  // Dynamically compute the process steps state based on the current database order status
  const getSteps = (status: Order["status"]): ProcessStep[] => {
    const isDraft = status === "Draft";
    const isSubmitted = status === "Submitted";
    const isInReview = status === "In Review";
    const isApproved = status === "Approved";

    return [
      {
        id: "submitted",
        title: "Registration Submitted",
        description: "The certified installer has digitally submitted the grid connection request.",
        state: isDraft ? "pending" : (isSubmitted ? "current" : "done"),
        date: isDraft ? undefined : "12.06.2026",
        actor: "Installer",
      },
      {
        id: "completeness",
        title: "Completeness Check",
        description: "All operator documents and certificates are automatically verified for completeness.",
        state: isDraft || isSubmitted ? "pending" : (isInReview ? "current" : "done"),
        date: isDraft || isSubmitted ? undefined : "13.06.2026",
        actor: "Grid Operator",
      },
      {
        id: "review",
        title: "Technical Feasibility Review",
        description: "Grid engineers inspect local grid capacity limits for the requested solar feed-in.",
        state: isApproved ? "done" : (isInReview ? "current" : "pending"),
        date: isInReview ? "since today" : isApproved ? "18.06.2026" : undefined,
        actor: "Grid Operator",
      },
      {
        id: "approval",
        title: "Grid Access Commitment",
        description: "The operator issues the formal authorization (Netzanschlusszusage) to connect.",
        state: isApproved ? "current" : "pending",
        actor: "Grid Operator",
      },
      {
        id: "completion",
        title: "Commissioning & Metering",
        description: "Meter installation is completed and grid feed-in starts.",
        state: "pending",
        actor: "Installer",
      },
    ];
  };

  const steps = getSteps(order.status);
  const currentStep = steps.find((s) => s.state === "current");
  const doneCount = steps.filter((s) => s.state === "done").length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const missingDocs = order.documents.filter((d) => d.status === "missing");

  // Handle mock uploading
  const handleUploadDoc = (docId: string) => {
    updateOrderDocumentStatus(order.id, docId, "complete");
  };

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
              Status Portal · Grid Connection
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Where does my application stand?
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Project Reference / Order-ID:{" "}
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                {order.id}
              </span>
            </p>
          </header>

          {/* Live status summary */}
          <div className="mt-6 flex flex-col gap-4 rounded-xl bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                Current Step
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {currentStep?.title ?? "Completed"}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {currentStep?.description ?? "Your request has been successfully approved."}
              </p>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-3xl font-extrabold text-blue-600">
                {progress}%
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {doneCount} of {steps.length} steps
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Missing document alert */}
          {missingDocs.length > 0 && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                !
              </span>
              <div className="text-sm">
                <p className="font-semibold text-red-800">
                  {missingDocs.length} required {missingDocs.length > 1 ? "documents" : "document"} missing
                </p>
                <p className="mt-0.5 text-red-700">
                  Please upload the missing files to proceed with the technical validation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Process Timeline */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <h2 className="mb-6 text-lg font-bold text-slate-800">Connection Milestones</h2>

          <ol className="relative">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast && (
                    <span
                      className={`absolute top-8 left-3.75 -ml-px h-full w-0.5 ${
                        step.state === "done" ? "bg-blue-500" : "bg-slate-200"
                      }`}
                      aria-hidden
                    />
                  )}

                  {/* Node */}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      step.state === "done"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : step.state === "current"
                          ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-500/20"
                          : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {step.state === "done" ? "✓" : index + 1}
                  </span>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${
                          step.state === "pending" ? "text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${actorBadge[step.actor]}`}>
                        {step.actor}
                      </span>
                      {step.state === "current" && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.description}</p>
                    {step.date && (
                      <p className="mt-1 text-[11px] font-medium text-slate-400">{step.date}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Documents Overview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <h2 className="mb-1 text-lg font-bold text-slate-800">Required Documents</h2>
          <p className="mb-6 text-sm text-slate-500 font-medium">
            Overview of all required documents for grid submission.
          </p>

          <ul className="space-y-3">
            {order.documents.map((doc) => {
              const meta = docStatusMeta[doc.status];
              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <span className="text-sm font-medium text-slate-700">{doc.label}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.className}`}
                    >
                      <span>{meta.icon}</span>
                      {meta.label}
                    </span>
                    {doc.status === "missing" && (
                      <button
                        type="button"
                        onClick={() => handleUploadDoc(doc.id)}
                        className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Footer navigation */}
        <div className="flex justify-between">
          <Link
            href={`/orders/${orderId}`}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            ← Back to Project
          </Link>
          <Link
            href={`/orders/${orderId}/details`}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Edit Data →
          </Link>
        </div>
      </div>
    </div>
  );
}
