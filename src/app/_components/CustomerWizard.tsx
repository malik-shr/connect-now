"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DetailTabs from "./DetailTabs";
import BackButton from "./BackButton";

// Kurzlabels für die anklickbare Schrittnavigation
const STEP_LABELS: Record<string, string> = {
  scan: "Ausweis",
  name: "Name",
  standort: "Standort",
  sameHome: "Wohnort",
  home: "Wohnadresse",
  contact: "Kontakt",
  verguetung: "Vergütung",
  zaehler: "Zähler",
  iban: "IBAN",
  uis: "Bestätigung",
  review: "Übersicht",
};

// ============================================================================
// CUSTOMER WIZARD — Yazio-Style, eine Frage pro Screen.
// Ersetzt das Formular auf /details/customer. Adressen werden über ein
// Autocomplete-Feld zusammengesetzt (Straße + Nr + PLZ + Stadt automatisch).
// Die Antworten werden am Ende auf die Schema-Feld-IDs gemappt, damit sie zum
// selben Datensatz wie die Installateur-Seite passen.
// ============================================================================

interface Address {
  street: string;
  number: string;
  plz: string;
  city: string;
}

interface Answers {
  mode?: "upload" | "manual";
  vorname: string;
  nachname: string;
  standort?: Address;
  sameHome?: boolean;
  home?: Address;
  phone: string;
  email: string;
  verguetung?: string;
  zaehler: string;
  iban: string;
  uisOk?: boolean;
}

const EMPTY: Answers = {
  vorname: "",
  nachname: "",
  phone: "",
  email: "",
  zaehler: "",
  iban: "",
};

// --- Mock-Adressdatenbank (später: Google Places / OSM Nominatim) ----------
const ADDRESS_DB: Address[] = [
  { street: "Sonnenallee", number: "100", plz: "12059", city: "Berlin" },
  { street: "Musterstraße", number: "12", plz: "10115", city: "Berlin" },
  { street: "Hauptstraße", number: "5", plz: "80331", city: "München" },
  { street: "Bahnhofstraße", number: "23", plz: "50667", city: "Köln" },
  { street: "Lindenweg", number: "7", plz: "70173", city: "Stuttgart" },
  { street: "Gartenstraße", number: "14", plz: "20095", city: "Hamburg" },
  { street: "Schulstraße", number: "3", plz: "60311", city: "Frankfurt am Main" },
  { street: "Dorfstraße", number: "42", plz: "01067", city: "Dresden" },
  { street: "Solarweg", number: "8", plz: "79100", city: "Freiburg" },
  { street: "Am Kraftwerk", number: "1", plz: "45127", city: "Essen" },
];

function fmt(a: Address) {
  return `${a.street} ${a.number}, ${a.plz} ${a.city}`;
}

const VERGUETUNG_OPTIONS = [
  {
    value: "Einspeisevergütung nach § 21 Abs. 1 EEG",
    label: "Feste Einspeisevergütung",
    desc: "Sie bekommen pro eingespeiste Kilowattstunde einen festen Betrag. Einfach & verlässlich.",
    icon: "💶",
  },
  {
    value: "Geförderte Direktvermarktung (Marktprämie) nach § 20 EEG",
    label: "Direktvermarktung",
    desc: "Ihr Strom wird an der Börse vermarktet – lohnt sich eher bei größeren Anlagen.",
    icon: "📈",
  },
  {
    value: "Unentgeltliche Abnahme",
    label: "Keine Vergütung",
    desc: "Sie verzichten auf eine Vergütung für den eingespeisten Strom.",
    icon: "🤝",
  },
];

// --- Address autocomplete field -------------------------------------------
function AddressPicker({
  value,
  onSelect,
}: {
  value?: Address;
  onSelect: (a: Address) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ADDRESS_DB.filter(
      (a) =>
        a.street.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.plz.startsWith(q),
    ).slice(0, 5);
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {value.street} {value.number}
            </p>
            <p className="text-sm text-slate-500">
              {value.plz} {value.city}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onSelect(undefined as unknown as Address);
          }}
          className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          Ändern
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg">
          🔍
        </span>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Adresse eingeben, z. B. Sonnenallee…"
          className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pr-4 pl-12 text-lg transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
        />
      </div>

      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {matches.map((a, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onSelect(a);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
              >
                <span className="text-lg">📍</span>
                <span className="text-sm text-slate-700">{fmt(a)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 2 && matches.length === 0 && (
        <p className="mt-3 text-sm text-slate-400">
          Keine Treffer – versuchen Sie z. B. „Musterstraße" oder „Berlin".
        </p>
      )}
    </div>
  );
}

// --- Main wizard ----------------------------------------------------------
export default function CustomerWizard({ orderId }: { orderId: string }) {
  const [a, setA] = useState<Answers>(EMPTY);
  const [stepIdx, setStepIdx] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [done, setDone] = useState(false);

  // Dynamische Schrittliste:
  // - "scan"-Schritt nur im Ausweis-Modus
  // - "home"-Schritt entfällt, wenn Wohn- = Anlagenadresse
  const stepKeys = useMemo(() => {
    const keys = ["intro", "start"];
    if (a.mode === "upload") keys.push("scan");
    keys.push("name", "standort", "sameHome");
    if (a.sameHome === false) keys.push("home");
    keys.push("contact", "verguetung", "zaehler", "iban", "uis", "review");
    return keys;
  }, [a.mode, a.sameHome]);

  const key = stepKeys[stepIdx]!;
  const total = stepKeys.length - 1; // intro zählt nicht zum Fortschritt
  const progress = Math.round((Math.min(stepIdx, total) / total) * 100);

  function set<K extends keyof Answers>(k: K, v: Answers[K]) {
    setA((prev) => ({ ...prev, [k]: v }));
  }

  function next() {
    const n = Math.min(stepIdx + 1, stepKeys.length - 1);
    setStepIdx(n);
    setMaxStep((m) => Math.max(m, n));
  }
  function back() {
    setStepIdx((i) => Math.max(0, i - 1));
  }
  // Sprung zu einem bereits besuchten Schritt (anklickbare Navigation)
  function goto(i: number) {
    if (i <= maxStep) setStepIdx(Math.max(0, i));
  }

  // Ausweis erkannt → Name + Anlagenadresse übernehmen, weiter zur Wohnadresse
  function applyScan(d: {
    vorname: string;
    nachname: string;
    address: Address;
  }) {
    setA((prev) => ({
      ...prev,
      vorname: d.vorname,
      nachname: d.nachname,
      standort: d.address,
    }));
    const target = stepKeys.indexOf("sameHome");
    setStepIdx(target);
    setMaxStep((m) => Math.max(m, target));
  }

  // Vom Ausweis-Schritt doch manuell: aktueller Index zeigt danach auf "name"
  function switchToManual() {
    set("mode", "manual");
  }

  // Validierung pro Schritt → steuert den "Weiter"-Button
  const canProceed = (() => {
    switch (key) {
      case "name":
        return a.vorname.trim() !== "" && a.nachname.trim() !== "";
      case "standort":
        return !!a.standort;
      case "home":
        return !!a.home;
      case "contact":
        return a.phone.trim() !== "" && /\S+@\S+\.\S+/.test(a.email);
      case "zaehler":
        return a.zaehler.trim() !== "";
      default:
        return true; // intro, choice-Schritte (auto-advance), iban (optional), review
    }
  })();

  function submit() {
    const home = a.sameHome === false ? a.home! : a.standort!;
    const payload = {
      orderId,
      filledBy: "customer",
      // Mapping auf die Schema-Feld-IDs (ui_schema_pv.json)
      "1001": "postalische Adresse",
      "1002": a.standort?.street,
      "1003": a.standort?.number,
      "1007": a.standort?.plz,
      "1008": a.standort?.city,
      "1101": a.nachname,
      "1102": a.vorname,
      "1103": home.street,
      "1104": home.number,
      "1106": home.plz,
      "1107": home.city,
      "1109": a.phone,
      "1110": a.email,
      "1111": a.iban,
      "1112": a.uisOk ? "Beides nicht zutreffend" : "",
      // Anschlussnehmer = Anlagenbetreiber (Standardfall "Sie selbst")
      "1201": a.nachname,
      "1202": a.vorname,
      "2018": a.verguetung,
      "3014": a.zaehler,
    };
    console.log("[CUSTOMER WIZARD] Payload:", payload);
    setDone(true);
  }

  // --- Success screen ---
  if (done) {
    return (
      <Shell orderId={orderId} progress={100}>
        <div className="yz-step flex flex-col items-center text-center" key="done">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
            🎉
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Geschafft!
          </h1>
          <p className="mt-3 max-w-md text-slate-500">
            Ihre Angaben sind übermittelt. Ihr Installateur ergänzt jetzt die
            technischen Daten – Sie können den Fortschritt jederzeit verfolgen.
          </p>
          <Link
            href={`/orders/${orderId}/status`}
            className="mt-8 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Status ansehen →
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      orderId={orderId}
      progress={key === "intro" ? 0 : progress}
      onBack={stepIdx > 0 ? back : undefined}
      nav={
        key === "intro" ? undefined : (
          <StepStrip
            stepKeys={stepKeys}
            current={stepIdx}
            maxStep={maxStep}
            onJump={goto}
          />
        )
      }
    >
      <div className="yz-step" key={key}>
        {key === "intro" && (
          <Center>
            <div className="text-5xl">☀️</div>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Lassen Sie uns Ihre Solaranlage anmelden
            </h1>
            <p className="mt-3 max-w-md text-lg text-slate-500">
              Wir stellen Ihnen ein paar einfache Fragen. Dauert nur 2 Minuten –
              den technischen Teil übernimmt Ihr Installateur.
            </p>
            <PrimaryButton onClick={next}>Los geht&apos;s</PrimaryButton>
          </Center>
        )}

        {key === "start" && (
          <Question
            title="Wie möchten Sie beginnen?"
            subtitle="Sparen Sie sich das Tippen – oder geben Sie alles selbst ein."
          >
            <ChoiceCards
              options={[
                {
                  value: "upload",
                  label: "Ausweis hochladen",
                  desc: "Wir lesen Name und Adresse automatisch aus. Geht in Sekunden.",
                  icon: "📷",
                },
                {
                  value: "manual",
                  label: "Manuell eingeben",
                  desc: "Sie tippen Ihre Daten Schritt für Schritt selbst ein.",
                  icon: "✍️",
                },
              ]}
              selected={a.mode}
              onPick={(v) => {
                set("mode", v as "upload" | "manual");
                next();
              }}
            />
          </Question>
        )}

        {key === "scan" && (
          <Question
            title="Ausweis hochladen"
            subtitle="Foto oder Scan Ihres Personalausweises. Wir lesen Name und Adresse automatisch aus."
          >
            <IdScanStep onComplete={applyScan} onManual={switchToManual} />
          </Question>
        )}

        {key === "name" && (
          <Question
            title="Wie heißen Sie?"
            subtitle="Als Betreiber der Anlage."
          >
            <div className="flex flex-col gap-3">
              <TextInput
                autoFocus
                value={a.vorname}
                onChange={(v) => set("vorname", v)}
                placeholder="Vorname"
                onEnter={() => canProceed && next()}
              />
              <TextInput
                value={a.nachname}
                onChange={(v) => set("nachname", v)}
                placeholder="Nachname"
                onEnter={() => canProceed && next()}
              />
            </div>
          </Question>
        )}

        {key === "standort" && (
          <Question
            title="Wo wird die Anlage installiert?"
            subtitle="Tippen Sie die Adresse – PLZ und Stadt füllen wir automatisch aus."
          >
            <AddressPicker
              value={a.standort}
              onSelect={(addr) => set("standort", addr)}
            />
          </Question>
        )}

        {key === "sameHome" && (
          <Question title="Wohnen Sie an dieser Adresse?">
            <ChoiceCards
              options={[
                { value: "yes", label: "Ja, hier wohne ich", icon: "🏡" },
                { value: "no", label: "Nein, andere Adresse", icon: "📮" },
              ]}
              onPick={(v) => {
                set("sameHome", v === "yes");
                next();
              }}
            />
          </Question>
        )}

        {key === "home" && (
          <Question title="Wie lautet Ihre Wohnadresse?">
            <AddressPicker
              value={a.home}
              onSelect={(addr) => set("home", addr)}
            />
          </Question>
        )}

        {key === "contact" && (
          <Question
            title="Wie erreichen wir Sie?"
            subtitle="Für Rückfragen und Benachrichtigungen zum Status."
          >
            <div className="flex flex-col gap-3">
              <TextInput
                autoFocus
                type="tel"
                value={a.phone}
                onChange={(v) => set("phone", v)}
                placeholder="Telefonnummer"
              />
              <TextInput
                type="email"
                value={a.email}
                onChange={(v) => set("email", v)}
                placeholder="E-Mail-Adresse"
                onEnter={() => canProceed && next()}
              />
            </div>
          </Question>
        )}

        {key === "verguetung" && (
          <Question
            title="Wie möchten Sie Ihren Strom vergütet bekommen?"
            subtitle="Keine Sorge – das lässt sich später anpassen."
          >
            <ChoiceCards
              options={VERGUETUNG_OPTIONS}
              selected={a.verguetung}
              onPick={(v) => {
                set("verguetung", v);
                next();
              }}
            />
          </Question>
        )}

        {key === "zaehler" && (
          <Question
            title="Wie lautet Ihre Zählernummer?"
            subtitle="Sie finden sie auf Ihrer Stromrechnung oder vorne auf dem Stromzähler."
          >
            <TextInput
              autoFocus
              value={a.zaehler}
              onChange={(v) => set("zaehler", v)}
              placeholder="z. B. 1ESY1234567890"
              mono
              onEnter={() => canProceed && next()}
            />
          </Question>
        )}

        {key === "iban" && (
          <Question
            title="Wohin sollen wir die Einspeisevergütung überweisen?"
            subtitle="Optional – Sie können das später nachtragen."
          >
            <TextInput
              autoFocus
              value={a.iban}
              onChange={(v) => set("iban", v)}
              placeholder="DE00 0000 0000 0000 0000 00"
              mono
              onEnter={next}
            />
          </Question>
        )}

        {key === "uis" && (
          <Question
            title="Eine kurze Bestätigung"
            subtitle="Für die EEG-Förderung müssen wir das wissen."
          >
            <ChoiceCards
              options={[
                {
                  value: "ok",
                  label: "Ich bestätige",
                  desc: "Kein Unternehmen in Schwierigkeiten, keine offenen Rückforderungen.",
                  icon: "✅",
                },
                {
                  value: "no",
                  label: "Trifft nicht zu",
                  desc: "Mein Fall ist anders – bitte später klären.",
                  icon: "↪️",
                },
              ]}
              onPick={(v) => {
                set("uisOk", v === "ok");
                next();
              }}
            />
          </Question>
        )}

        {key === "review" && (
          <Question
            title="Passt alles?"
            subtitle="Sie können jeden Punkt über den Zurück-Pfeil noch ändern."
          >
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              <Row label="Name" value={`${a.vorname} ${a.nachname}`} />
              <Row
                label="Anlagenstandort"
                value={a.standort ? fmt(a.standort) : "—"}
              />
              <Row
                label="Wohnadresse"
                value={
                  a.sameHome === false && a.home
                    ? fmt(a.home)
                    : "wie Anlagenstandort"
                }
              />
              <Row label="Kontakt" value={`${a.phone} · ${a.email}`} />
              <Row label="Vergütung" value={a.verguetung ?? "—"} />
              <Row label="Zählernummer" value={a.zaehler || "—"} />
              <Row label="IBAN" value={a.iban || "—"} />
            </dl>
          </Question>
        )}
      </div>

      {/* Footer-Aktion (nicht bei Auto-Advance-Schritten) */}
      {!["intro", "start", "scan", "sameHome", "verguetung", "uis"].includes(
        key,
      ) && (
        <div className="mt-8 flex justify-center">
          {key === "review" ? (
            <PrimaryButton onClick={submit}>Angaben absenden ✓</PrimaryButton>
          ) : (
            <PrimaryButton onClick={next} disabled={!canProceed}>
              {key === "iban" && a.iban.trim() === "" ? "Überspringen" : "Weiter"}
            </PrimaryButton>
          )}
        </div>
      )}
    </Shell>
  );
}

// --- Layout & primitives --------------------------------------------------
function Shell({
  children,
  orderId,
  progress,
  onBack,
  nav,
}: {
  children: React.ReactNode;
  orderId: string;
  progress: number;
  onBack?: () => void;
  nav?: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="sticky top-16 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 pt-4 pb-3">
          {/* Ansichts-Tabs & Back Button */}
          <div className="flex items-center justify-between">
            <BackButton href={`/orders/${orderId}`} />
            <DetailTabs orderId={orderId} active="customer" />
          </div>

          {/* Progress + back */}
          <div className="mt-4 flex items-center gap-4">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Zurück"
              >
                ←
              </button>
            ) : (
              <div className="h-9 w-9 shrink-0" />
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Anklickbare Schrittnavigation */}
          {nav && <div className="mt-3">{nav}</div>}
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}

// Anklickbare Chips für besuchte Schritte – Sprung zurück & ändern.
function StepStrip({
  stepKeys,
  current,
  maxStep,
  onJump,
}: {
  stepKeys: string[];
  current: number;
  maxStep: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {stepKeys.map((k, i) => {
        if (k === "intro" || k === "start") return null;
        const reachable = i <= maxStep;
        const active = i === current;
        return (
          <button
            key={`${k}-${i}`}
            type="button"
            disabled={!reachable}
            onClick={() => onJump(i)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active
                ? "bg-blue-600 text-white"
                : reachable
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "cursor-not-allowed bg-slate-50 text-slate-300"
            }`}
          >
            {STEP_LABELS[k] ?? k}
          </button>
        );
      })}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">{children}</div>
  );
}

function Question({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  mono,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  mono?: boolean;
  onEnter?: () => void;
}) {
  return (
    <input
      autoFocus={autoFocus}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
      }}
      placeholder={placeholder}
      className={`w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none ${
        mono ? "font-mono" : ""
      }`}
    />
  );
}

function ChoiceCards({
  options,
  selected,
  onPick,
}: {
  options: { value: string; label: string; desc?: string; icon: string }[];
  selected?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md ${
            selected === o.value
              ? "border-blue-600 bg-blue-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <span className="text-3xl">{o.icon}</span>
          <span className="flex flex-col">
            <span className="text-base font-bold text-slate-800">
              {o.label}
            </span>
            {o.desc && (
              <span className="mt-0.5 text-sm text-slate-500">{o.desc}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  );
}

// Ausweis-Upload mit (mock) automatischer Extraktion von Name + Adresse.
// Später: echtes OCR oder LLM-Vision (passt zu LZ5 – automatische Prüfung).
function IdScanStep({
  onComplete,
  onManual,
}: {
  onComplete: (d: {
    vorname: string;
    nachname: string;
    address: Address;
  }) => void;
  onManual: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setProcessing(true);
    // Demo: simulierte Extraktion. Hier später Vision-API / OCR aufrufen.
    setTimeout(() => {
      onComplete({
        vorname: "Max",
        nachname: "Mustermann",
        address: {
          street: "Musterstraße",
          number: "12",
          plz: "10115",
          city: "Berlin",
        },
      });
    }, 1700);
  }

  if (processing) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-10 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm font-semibold text-slate-700">
          Ausweis wird ausgelesen…
        </p>
        <p className="text-xs text-slate-500">
          Name und Adresse werden automatisch erkannt.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <span className="text-4xl">🪪</span>
        <span className="text-base font-bold text-slate-800">
          Ausweis auswählen
        </span>
        <span className="text-sm text-slate-500">
          Foto aufnehmen oder Datei hochladen (Vorder- &amp; Rückseite)
        </span>
      </label>
      <p className="text-center text-xs text-slate-400">
        Ihre Daten werden nur zur Vorausfüllung der Felder genutzt.
      </p>
      <button
        type="button"
        onClick={onManual}
        className="text-center text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        Lieber manuell eingeben →
      </button>
    </div>
  );
}
