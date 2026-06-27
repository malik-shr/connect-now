"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";

// ============================================================================
// NO-CODE METERING CONCEPT BUILDER — Guided wizard (prototype)
//
// Idea: Non-technical customers don't build a free-form diagram, but instead
// answer plain-language questions. From these, the matching standard metering
// concept is automatically derived, visualized as a single-line diagram, and
// output as structured JSON (LZ2 / LZ4 / LV1). The JSON is the basis for the
// later LLM completeness check (LZ5 / LZ6).
// ============================================================================

// --- TYPES ---------------------------------------------------------------
type NodeType =
  | "netz"
  | "zaehler"
  | "erzeuger"
  | "speicher"
  | "verbraucher"
  | "sammelschiene";

interface ConceptNode {
  id: string;
  type: NodeType;
  label: string;
  meta?: string;
}

interface ConceptEdge {
  from: string;
  to: string;
}

interface Messkonzept {
  key: string;
  title: string;
  summary: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

interface Answers {
  einspeisung?: "voll" | "ueberschuss";
  speicher?: "ja" | "nein";
  steuerbar?: "ja" | "nein";
}

// --- WIZARD QUESTIONS -----------------------------------------------------
interface Option {
  value: string;
  label: string;
  desc: string;
  icon: string;
}

interface Step {
  id: keyof Answers;
  question: string;
  help: string;
  options: Option[];
}

const STEPS: Step[] = [
  {
    id: "einspeisung",
    question: "How would you like to use your solar power?",
    help: "This determines which meters you need.",
    options: [
      {
        value: "ueberschuss",
        label: "Use it yourself",
        desc: "You use the electricity in your home and feed only the surplus into the grid.",
        icon: "🏠",
      },
      {
        value: "voll",
        label: "Feed in completely",
        desc: "All generated electricity is fed into the grid (full feed-in).",
        icon: "⚡",
      },
    ],
  },
  {
    id: "speicher",
    question: "Do you have a battery storage system?",
    help: "A storage system holds surplus electricity for later use.",
    options: [
      {
        value: "ja",
        label: "Yes, with storage",
        desc: "A battery storage system is part of the system.",
        icon: "🔋",
      },
      {
        value: "nein",
        label: "No, without storage",
        desc: "No battery storage present.",
        icon: "🚫",
      },
    ],
  },
  {
    id: "steuerbar",
    question: "Are there any controllable loads?",
    help: "E.g. a heat pump or wallbox (controllable consumption device per §14a EnWG).",
    options: [
      {
        value: "ja",
        label: "Yes, present",
        desc: "A heat pump, wallbox or similar will be connected as well.",
        icon: "🚗",
      },
      {
        value: "nein",
        label: "No",
        desc: "No additional controllable loads.",
        icon: "—",
      },
    ],
  },
];

// --- CONCEPT RESOLUTION ---------------------------------------------------
// Maps the answers onto a standardized metering concept.
function resolveConcept(a: Answers): Messkonzept | null {
  if (!a.einspeisung || !a.speicher || !a.steuerbar) return null;

  const netz: ConceptNode = { id: "netz", type: "netz", label: "Grid connection" };
  const steuerbarNode: ConceptNode | null =
    a.steuerbar === "ja"
      ? {
          id: "z_steuer",
          type: "verbraucher",
          label: "Controllable device",
          meta: "§14a EnWG · separate meter",
        }
      : null;

  // 1) Full feed-in: separate generation and consumption meters
  if (a.einspeisung === "voll") {
    const nodes: ConceptNode[] = [
      netz,
      { id: "z_einsp", type: "zaehler", label: "Feed-in meter", meta: "Z1 · Generation" },
      { id: "z_bezug", type: "zaehler", label: "Consumption meter", meta: "Z2 · Consumption" },
      { id: "pv", type: "erzeuger", label: "PV system" },
      { id: "haus", type: "verbraucher", label: "Household consumption" },
    ];
    const edges: ConceptEdge[] = [
      { from: "netz", to: "z_einsp" },
      { from: "z_einsp", to: "pv" },
      { from: "netz", to: "z_bezug" },
      { from: "z_bezug", to: "haus" },
    ];
    if (steuerbarNode) {
      nodes.push(steuerbarNode);
      edges.push({ from: "netz", to: "z_steuer" });
    }
    return {
      key: a.steuerbar === "ja" ? "voll-steuerbar" : "voll",
      title: "Full feed-in",
      summary:
        "Generation and consumption are metered separately. All PV electricity flows into the grid via the feed-in meter.",
      nodes,
      edges,
    };
  }

  // 2) Surplus feed-in (self-consumption) — with/without storage
  const sammel: ConceptNode = {
    id: "sammel",
    type: "sammelschiene",
    label: "Busbar / house service connection",
  };
  const nodes: ConceptNode[] = [
    netz,
    {
      id: "z_zwei",
      type: "zaehler",
      label: "Bidirectional meter",
      meta: "Z1 · Consumption + feed-in",
    },
    sammel,
    { id: "pv", type: "erzeuger", label: "PV system" },
    { id: "haus", type: "verbraucher", label: "Household consumption" },
  ];
  const edges: ConceptEdge[] = [
    { from: "netz", to: "z_zwei" },
    { from: "z_zwei", to: "sammel" },
    { from: "sammel", to: "pv" },
    { from: "sammel", to: "haus" },
  ];

  if (a.speicher === "ja") {
    nodes.push({
      id: "speicher",
      type: "speicher",
      label: "Battery storage",
    });
    edges.push({ from: "sammel", to: "speicher" });
  }
  if (steuerbarNode) {
    nodes.push(steuerbarNode);
    edges.push({ from: "z_steuer", to: "sammel" });
    edges.push({ from: "netz", to: "z_steuer" });
  }

  return {
    key:
      "ueberschuss" +
      (a.speicher === "ja" ? "-speicher" : "") +
      (a.steuerbar === "ja" ? "-steuerbar" : ""),
    title:
      a.speicher === "ja"
        ? "Surplus feed-in with storage"
        : "Surplus feed-in",
    summary:
      "A bidirectional meter measures consumption and feed-in. The PV electricity is primarily self-consumed" +
      (a.speicher === "ja" ? ", surplus energy is buffered in the storage system" : "") +
      ", and only the remainder is fed into the grid.",
    nodes,
    edges,
  };
}

// --- NODE VISUALS ---------------------------------------------------------
const NODE_STYLE: Record<NodeType, { icon: string; className: string }> = {
  netz: { icon: "🔌", className: "border-slate-300 bg-slate-100 text-slate-700" },
  zaehler: { icon: "⏱️", className: "border-blue-300 bg-blue-50 text-blue-700" },
  erzeuger: { icon: "☀️", className: "border-amber-300 bg-amber-50 text-amber-700" },
  speicher: { icon: "🔋", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  verbraucher: { icon: "🏠", className: "border-violet-300 bg-violet-50 text-violet-700" },
  sammelschiene: { icon: "🔗", className: "border-slate-300 bg-white text-slate-600" },
};

function DiagramNode({ node }: { node: ConceptNode }) {
  const s = NODE_STYLE[node.type];
  return (
    <div
      className={`flex min-w-[120px] flex-col items-center rounded-xl border-2 px-3 py-2 text-center shadow-sm ${s.className}`}
    >
      <span className="text-xl leading-none">{s.icon}</span>
      <span className="mt-1 text-xs font-bold">{node.label}</span>
      {node.meta && (
        <span className="mt-0.5 text-[10px] font-medium opacity-70">
          {node.meta}
        </span>
      )}
    </div>
  );
}

// Simplified single-line diagram: grid → meter → busbar → components.
function Diagram({ concept }: { concept: Messkonzept }) {
  const byId = (id: string) => concept.nodes.find((n) => n.id === id)!;
  const meters = concept.nodes.filter((n) => n.type === "zaehler");
  const hub =
    concept.nodes.find((n) => n.type === "sammelschiene") ??
    concept.nodes.find((n) => n.type === "zaehler")!;
  const leaves = concept.nodes.filter(
    (n) =>
      n.type === "erzeuger" ||
      n.type === "speicher" ||
      n.type === "verbraucher",
  );

  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-6">
      <DiagramNode node={byId("netz")} />
      <div className="h-5 w-0.5 bg-slate-300" />
      <div className="flex flex-wrap items-start justify-center gap-3">
        {meters.map((m) => (
          <DiagramNode key={m.id} node={m} />
        ))}
      </div>
      <div className="h-5 w-0.5 bg-slate-300" />
      <DiagramNode node={hub} />
      <div className="h-5 w-0.5 bg-slate-300" />
      <div className="flex flex-wrap items-start justify-center gap-3">
        {leaves.map((l) => (
          <DiagramNode key={l.id} node={l} />
        ))}
      </div>
    </div>
  );
}

// --- PAGE -----------------------------------------------------------------
export default function MesskonzeptPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showJson, setShowJson] = useState(false);

  const isResult = stepIndex >= STEPS.length;
  const concept = useMemo(() => resolveConcept(answers), [answers]);
  const progress = Math.round(
    (Math.min(stepIndex, STEPS.length) / STEPS.length) * 100,
  );

  function choose(stepId: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [stepId]: value as never }));
    setStepIndex((i) => i + 1);
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function restart() {
    setAnswers({});
    setStepIndex(0);
    setShowJson(false);
  }

  const jsonPayload = concept
    ? JSON.stringify(
        {
          orderId,
          messkonzept: concept.key,
          titel: concept.title,
          nodes: concept.nodes,
          edges: concept.edges,
        },
        null,
        2,
      )
    : "";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <header className="border-b border-slate-200 pb-5">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              No-Code Builder · Metering concept
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Build your metering concept
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order number / Order ID:{" "}
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                {orderId}
              </span>
            </p>
          </header>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                {isResult
                  ? "Done"
                  : `Question ${stepIndex + 1} of ${STEPS.length}`}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Wizard step */}
          {!isResult && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-800">
                {STEPS[stepIndex]!.question}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {STEPS[stepIndex]!.help}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {STEPS[stepIndex]!.options.map((opt) => {
                  const selected = answers[STEPS[stepIndex]!.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => choose(STEPS[stepIndex]!.id, opt.value)}
                      className={`group flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md ${
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="mt-2 text-sm font-bold text-slate-800">
                        {opt.label}
                      </span>
                      <span className="mt-1 text-xs leading-relaxed text-slate-500">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={back}
                  className="mt-6 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  ← Back
                </button>
              )}
            </div>
          )}

          {/* Result */}
          {isResult && concept && (
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
                    Recommended metering concept
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-slate-800">
                    {concept.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {concept.summary}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700">
                  Single-line diagram
                </h3>
                <Diagram concept={concept} />
              </div>

              {/* JSON output (LLM-verifiable data structure) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowJson((v) => !v)}
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  {showJson ? "▾" : "▸"} Structured data (JSON) for the
                  automated check
                </button>
                {showJson && (
                  <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-[11px] leading-relaxed text-slate-100">
                    {jsonPayload}
                  </pre>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={restart}
                  className="cursor-pointer text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  ↻ Start over
                </button>
                <button
                  type="button"
                  onClick={() =>
                    console.log("[MESSKONZEPT] Payload:", jsonPayload)
                  }
                  className="cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                >
                  Apply metering concept
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
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
