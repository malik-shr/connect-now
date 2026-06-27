import Link from "next/link";
import BackButton from "~/app/_components/BackButton";

// --- TYPES ---
type StepState = "done" | "current" | "pending";

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  state: StepState;
  date?: string;
  actor: "Kunde" | "Installateur" | "Netzbetreiber";
}

interface DocumentItem {
  id: string;
  label: string;
  status: "complete" | "missing" | "review";
}

// --- MOCKED DATA (later: load from DB by orderId) ---
const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "submitted",
    title: "Anmeldung eingereicht",
    description:
      "Der Installateur hat das Netzanschlussbegehren für Ihre PV-Anlage digital übermittelt.",
    state: "done",
    date: "12.06.2026",
    actor: "Installateur",
  },
  {
    id: "completeness",
    title: "Vollständigkeitsprüfung",
    description:
      "Die Unterlagen wurden automatisch (KI-gestützt) auf Vollständigkeit und Plausibilität geprüft.",
    state: "done",
    date: "13.06.2026",
    actor: "Netzbetreiber",
  },
  {
    id: "review",
    title: "Fachliche Prüfung durch Netzbetreiber",
    description:
      "Der Netzbetreiber prüft aktuell die technischen Angaben Ihres Anschlussbegehrens.",
    state: "current",
    date: "seit 18.06.2026",
    actor: "Netzbetreiber",
  },
  {
    id: "approval",
    title: "Netzanschlusszusage",
    description:
      "Nach erfolgreicher Prüfung erhalten Sie die offizielle Zusage zum Netzanschluss.",
    state: "pending",
    actor: "Netzbetreiber",
  },
  {
    id: "completion",
    title: "Fertigmeldung & Inbetriebnahme",
    description:
      "Der Installateur reicht die Fertigmeldung ein, anschließend erfolgt die Inbetriebnahme.",
    state: "pending",
    actor: "Installateur",
  },
];

const DOCUMENTS: DocumentItem[] = [
  { id: "e8", label: "Datenblatt Wechselrichter (E.8)", status: "complete" },
  { id: "lageplan", label: "Lageplan / Übersichtsschaltplan", status: "complete" },
  { id: "messkonzept", label: "Messkonzept", status: "review" },
  { id: "vollmacht", label: "Vollmacht des Anlagenbetreibers", status: "missing" },
];

// --- STYLE HELPERS ---
const actorBadge: Record<ProcessStep["actor"], string> = {
  Kunde: "bg-emerald-100 text-emerald-700",
  Installateur: "bg-amber-100 text-amber-700",
  Netzbetreiber: "bg-blue-100 text-blue-700",
};

const docStatusMeta: Record<
  DocumentItem["status"],
  { label: string; className: string; icon: string }
> = {
  complete: {
    label: "Vollständig",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✓",
  },
  review: {
    label: "In Prüfung",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "⏳",
  },
  missing: {
    label: "Fehlt",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "!",
  },
};

export default async function StatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const currentStep = PROCESS_STEPS.find((s) => s.state === "current");
  const doneCount = PROCESS_STEPS.filter((s) => s.state === "done").length;
  const progress = Math.round((doneCount / PROCESS_STEPS.length) * 100);
  const missingDocs = DOCUMENTS.filter((d) => d.status === "missing");

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
              Status-Portal · Netzanschluss
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Wo steht meine Anfrage?
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Vorgangsnummer / Order-ID:{" "}
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                {orderId}
              </span>
            </p>
          </header>

          {/* Live status summary */}
          <div className="mt-6 flex flex-col gap-4 rounded-xl bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                Aktueller Status
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {currentStep?.title ?? "Abgeschlossen"}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {currentStep?.description ?? "Ihr Vorgang ist vollständig bearbeitet."}
              </p>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-3xl font-extrabold text-blue-600">
                {progress}%
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {doneCount} von {PROCESS_STEPS.length} Schritten
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
                  {missingDocs.length} Dokument
                  {missingDocs.length > 1 ? "e" : ""} fehlt noch
                </p>
                <p className="mt-0.5 text-red-700">
                  Bitte reichen Sie die fehlenden Unterlagen digital nach, damit
                  die Bearbeitung fortgesetzt werden kann.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Process Timeline */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <h2 className="mb-6 text-lg font-bold text-slate-800">
            Bearbeitungsverlauf
          </h2>

          <ol className="relative">
            {PROCESS_STEPS.map((step, index) => {
              const isLast = index === PROCESS_STEPS.length - 1;
              return (
                <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Connector line */}
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
                          step.state === "pending"
                            ? "text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${actorBadge[step.actor]}`}
                      >
                        {step.actor}
                      </span>
                      {step.state === "current" && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Aktuell
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                    {step.date && (
                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        {step.date}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Documents Overview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <h2 className="mb-1 text-lg font-bold text-slate-800">Unterlagen</h2>
          <p className="mb-6 text-sm text-slate-500">
            Übersicht aller für den Netzanschluss erforderlichen Dokumente.
          </p>

          <ul className="space-y-3">
            {DOCUMENTS.map((doc) => {
              const meta = docStatusMeta[doc.status];
              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {doc.label}
                  </span>
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
                        className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                      >
                        Hochladen
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
            ← Zurück zum Vorgang
          </Link>
          <Link
            href={`/orders/${orderId}/details`}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Daten bearbeiten →
          </Link>
        </div>
      </div>
    </div>
  );
}
