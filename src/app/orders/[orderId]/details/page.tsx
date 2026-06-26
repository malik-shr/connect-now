import { redirect } from "next/navigation";
import uiSchemaData from "./ui_schema_pv.json";

// Define strict TypeScript shapes matching your UI Schema JSON
interface UiField {
  id: string;
  label: string;
  type: "text" | "select" | "boolean";
  required: boolean;
  helpText: string;
  unit: string;
  options?: string[];
}

interface UiSection {
  section: string;
  fields: UiField[];
}

export default async function Details({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const sections = uiSchemaData as UiSection[];

  // --- BACKEND LOGIC: Server Action to handle execution safely on Node server ---
  async function submitGridData(formData: FormData) {
    "use server";

    const submissionPayload: Record<string, any> = {};

    // Map through our dynamic UI definition to collect form attributes
    sections.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.type === "boolean") {
          // Checkboxes do not post a value if left unchecked
          submissionPayload[field.id] = formData.has(field.id);
        } else {
          submissionPayload[field.id] = formData.get(field.id);
        }
      });
    });

    // Write your database mutations here
    console.log(
      `[SERVER] Received Grid Connection 3.0 Dataset for Order: ${orderId}`,
    );
    console.log("[SERVER] Form Payload:", submissionPayload);

    // Redirect user back out to the core order management view upon completion
    redirect("/orders");
  }

  // --- FRONTEND LOGIC: Safe Semantic UI Construction ---
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        {/* Context Header */}
        <header className="mb-8 border-b border-slate-200 pb-5">
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
            Digital Grid Connection Data Set 3.0
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Netzanschlussbegehren bearbeiten
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Vorgangsnummer / Order-ID:{" "}
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
              {orderId}
            </span>
          </p>
        </header>

        {/* Dynamic Schema Form Execution */}
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
                    {/* Input Labeling */}
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

                    {/* Rendering Engine Conditional Branching */}
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

                    {/* Form Context Help Subtext */}
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

          {/* Core Submission Bar */}
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
