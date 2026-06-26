"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";

// ============================================================================
// NO-CODE MESSKONZEPT BUILDER — Geführter Wizard (Prototyp)
//
// Idee: Nicht-technische Kunden bauen kein freies Diagramm, sondern beantworten
// Klartext-Fragen. Daraus wird automatisch das passende Standard-Messkonzept
// abgeleitet, als Einliniendiagramm visualisiert und als strukturiertes JSON
// ausgegeben (LZ2 / LZ4 / LV1). Das JSON ist die Basis für die spätere
// LLM-Vollständigkeitsprüfung (LZ5 / LZ6).
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
    question: "Wie möchten Sie Ihren Solarstrom nutzen?",
    help: "Das bestimmt, welche Zähler Sie benötigen.",
    options: [
      {
        value: "ueberschuss",
        label: "Selbst verbrauchen",
        desc: "Sie nutzen den Strom im Haus und speisen nur den Überschuss ins Netz ein.",
        icon: "🏠",
      },
      {
        value: "voll",
        label: "Komplett einspeisen",
        desc: "Der gesamte erzeugte Strom wird ins Netz eingespeist (Volleinspeisung).",
        icon: "⚡",
      },
    ],
  },
  {
    id: "speicher",
    question: "Haben Sie einen Batteriespeicher?",
    help: "Ein Speicher legt überschüssigen Strom für später zurück.",
    options: [
      {
        value: "ja",
        label: "Ja, mit Speicher",
        desc: "Ein Batteriespeicher ist Teil der Anlage.",
        icon: "🔋",
      },
      {
        value: "nein",
        label: "Nein, ohne Speicher",
        desc: "Kein Batteriespeicher vorhanden.",
        icon: "🚫",
      },
    ],
  },
  {
    id: "steuerbar",
    question: "Gibt es steuerbare Verbraucher?",
    help: "Z. B. Wärmepumpe oder Wallbox (steuerbare Verbrauchseinrichtung nach §14a EnWG).",
    options: [
      {
        value: "ja",
        label: "Ja, vorhanden",
        desc: "Wärmepumpe, Wallbox o. Ä. wird mit angeschlossen.",
        icon: "🚗",
      },
      {
        value: "nein",
        label: "Nein",
        desc: "Keine zusätzlichen steuerbaren Verbraucher.",
        icon: "—",
      },
    ],
  },
];

// --- CONCEPT RESOLUTION ---------------------------------------------------
// Bildet die Antworten auf ein standardisiertes Messkonzept ab.
function resolveConcept(a: Answers): Messkonzept | null {
  if (!a.einspeisung || !a.speicher || !a.steuerbar) return null;

  const netz: ConceptNode = { id: "netz", type: "netz", label: "Netzanschluss" };
  const steuerbarNode: ConceptNode | null =
    a.steuerbar === "ja"
      ? {
          id: "z_steuer",
          type: "verbraucher",
          label: "Steuerbare Einrichtung",
          meta: "§14a EnWG · sep. Zähler",
        }
      : null;

  // 1) Volleinspeisung: getrennter Erzeugungs- und Bezugszähler
  if (a.einspeisung === "voll") {
    const nodes: ConceptNode[] = [
      netz,
      { id: "z_einsp", type: "zaehler", label: "Einspeisezähler", meta: "Z1 · Erzeugung" },
      { id: "z_bezug", type: "zaehler", label: "Bezugszähler", meta: "Z2 · Verbrauch" },
      { id: "pv", type: "erzeuger", label: "PV-Anlage" },
      { id: "haus", type: "verbraucher", label: "Hausverbrauch" },
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
      title: "Volleinspeisung",
      summary:
        "Erzeugung und Verbrauch werden getrennt gemessen. Der gesamte PV-Strom fließt über den Einspeisezähler ins Netz.",
      nodes,
      edges,
    };
  }

  // 2) Überschusseinspeisung (Eigenverbrauch) — mit/ohne Speicher
  const sammel: ConceptNode = {
    id: "sammel",
    type: "sammelschiene",
    label: "Sammelschiene / HAK",
  };
  const nodes: ConceptNode[] = [
    netz,
    {
      id: "z_zwei",
      type: "zaehler",
      label: "Zweirichtungszähler",
      meta: "Z1 · Bezug + Einspeisung",
    },
    sammel,
    { id: "pv", type: "erzeuger", label: "PV-Anlage" },
    { id: "haus", type: "verbraucher", label: "Hausverbrauch" },
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
      label: "Batteriespeicher",
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
        ? "Überschusseinspeisung mit Speicher"
        : "Überschusseinspeisung",
    summary:
      "Ein Zweirichtungszähler misst Bezug und Einspeisung. Der PV-Strom wird vorrangig selbst verbraucht" +
      (a.speicher === "ja" ? ", überschüssige Energie im Speicher gepuffert" : "") +
      ", nur der Rest ins Netz eingespeist.",
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

// Vereinfachtes Einliniendiagramm: Netz → Zähler → Sammelschiene → Komponenten.
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
              No-Code Builder · Messkonzept
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Messkonzept zusammenstellen
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Vorgangsnummer / Order-ID:{" "}
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
                  ? "Fertig"
                  : `Frage ${stepIndex + 1} von ${STEPS.length}`}
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
                  ← Zurück
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
                    Empfohlenes Messkonzept
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
                  Einliniendiagramm
                </h3>
                <Diagram concept={concept} />
              </div>

              {/* JSON output (LLM-prüfbare Datenstruktur) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowJson((v) => !v)}
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  {showJson ? "▾" : "▸"} Strukturierte Daten (JSON) für die
                  automatische Prüfung
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
                  ↻ Neu starten
                </button>
                <button
                  type="button"
                  onClick={() =>
                    console.log("[MESSKONZEPT] Payload:", jsonPayload)
                  }
                  className="cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                >
                  Messkonzept übernehmen
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
            ← Zurück zum Vorgang
          </Link>
          <Link
            href={`/orders/${orderId}/status`}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Status ansehen →
          </Link>
        </div>
      </div>
    </div>
  );
}
