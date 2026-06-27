import { redirect } from "next/navigation";

import DetailTabs from "./DetailTabs";
import BackButton from "./BackButton";

// Shared, schema-driven Datensatz-Form. Wird von /details/customer und
// /details/installer mit gefilterten Sections genutzt; /details bleibt davon
// unberührt.

export type Audience = "all" | "customer" | "installer";

export interface UiField {
  id: string;
  owner?: Audience;
  label: string;
  type: "text" | "select" | "boolean";
  required: boolean;
  helpText: string;
  unit: string;
  options?: string[];
}

export interface UiSection {
  section: string;
  fields: UiField[];
}

// Filtert das Schema nach Zielgruppe. Felder ohne owner gelten als installer.
export function filterSections(
  sections: UiSection[],
  audience: Audience,
): UiSection[] {
  if (audience === "all") return sections;
  return sections
    .map((s) => ({
      ...s,
      fields: s.fields.filter((f) => (f.owner ?? "installer") === audience),
    }))
    .filter((s) => s.fields.length > 0);
}

const AUDIENCE_META: Record<
  Audience,
  { eyebrow: string; title: string; intro: string; accent: string }
> = {
  all: {
    eyebrow: "Digital Grid Connection Data Set 3.0",
    title: "Netzanschlussbegehren – vollständig",
    intro: "Alle Felder des Datensatzes.",
    accent: "text-blue-600",
  },
  customer: {
    eyebrow: "Ihr Teil · einfach erklärt",
    title: "Ihre Angaben",
    intro:
      "Nur die Daten, die Sie selbst kennen – persönliche Angaben, Adresse und Ihre Wünsche. Den technischen Teil übernimmt Ihr Installateur.",
    accent: "text-emerald-600",
  },
  installer: {
    eyebrow: "Fachbetrieb · Technischer Datensatz",
    title: "Technische Angaben",
    intro:
      "Gerätedaten, Zertifikate, Schutz- und Messkonzept. Die persönlichen Daten des Kunden sind hier ausgeblendet.",
    accent: "text-blue-600",
  },
};

export default function GridDataForm({
  orderId,
  audience,
  sections,
}: {
  orderId: string;
  audience: Audience;
  sections: UiSection[];
}) {
  const meta = AUDIENCE_META[audience];

  async function submitGridData(formData: FormData) {
    "use server";

    const submissionPayload: Record<string, unknown> = {};
    sections.forEach((group) => {
      group.fields.forEach((field) => {
        submissionPayload[field.id] =
          field.type === "boolean"
            ? formData.has(field.id)
            : formData.get(field.id);
      });
    });

    console.log(
      `[SERVER] Grid dataset (${audience}) for Order ${orderId}:`,
      submissionPayload,
    );
    redirect(`/orders/${orderId}`);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        {/* Context Header */}
        <header className="mb-8 border-b border-slate-200 pb-5">
          <div className="mb-6 flex items-center justify-between">
            <BackButton href={`/orders/${orderId}`} />
            <DetailTabs orderId={orderId} active={audience} />
          </div>
          <span
            className={`block text-xs font-bold tracking-wider uppercase ${meta.accent}`}
          >
            {meta.eyebrow}
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{meta.intro}</p>
          <p className="mt-2 text-sm text-slate-500">
            Vorgangsnummer / Order-ID:{" "}
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
              {orderId}
            </span>
          </p>
        </header>

        <form action={submitGridData} className="space-y-10">
          {sections.map((group, sectionIndex) => (
            <section
              key={sectionIndex}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition-all hover:shadow-sm sm:p-6"
            >
              <h2 className="mb-5 border-b border-slate-200 pb-2 text-lg font-bold text-slate-800">
                {group.section}
              </h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.id} className="flex flex-col space-y-1.5">
                    <label
                      htmlFor={field.id}
                      className="flex items-center text-xs font-semibold text-slate-700"
                    >
                      {field.label}
                      {field.required && (
                        <span
                          className="ml-1 font-bold text-red-500"
                          title="Pflichtfeld"
                        >
                          *
                        </span>
                      )}
                    </label>

                    {field.type === "select" ? (
                      <select
                        id={field.id}
                        name={field.id}
                        required={field.required}
                        defaultValue=""
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      >
                        <option value="" disabled>
                          -- Bitte wählen --
                        </option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <div className="flex h-full items-center pt-1">
                        <label className="inline-flex cursor-pointer items-center space-x-3">
                          <input
                            type="checkbox"
                            id={field.id}
                            name={field.id}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-600">
                            Ja / Aktivieren
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative flex items-center rounded-lg shadow-sm">
                        <input
                          type="text"
                          id={field.id}
                          name={field.id}
                          required={field.required}
                          placeholder={field.label}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                        {field.unit &&
                          field.unit !== "" &&
                          field.unit !== "-" && (
                            <span className="absolute right-3 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 select-none">
                              {field.unit}
                            </span>
                          )}
                      </div>
                    )}

                    {field.helpText && (
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {field.helpText.split("\n").map((line, i) => (
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none sm:w-auto"
            >
              Daten absenden & Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
