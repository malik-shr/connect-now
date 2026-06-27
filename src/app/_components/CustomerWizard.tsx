"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DetailTabs from "./DetailTabs";
import BackButton from "./BackButton";

// Short labels for the clickable step navigation
const STEP_LABELS: Record<string, string> = {
  scan: "ID card",
  name: "Name",
  standort: "Location",
  sameHome: "Residence",
  home: "Home address",
  contact: "Contact",
  verguetung: "Compensation",
  zaehler: "Meter",
  iban: "IBAN",
  uis: "Confirmation",
  review: "Summary",
};

// ============================================================================
// CUSTOMER WIZARD — Yazio-style, one question per screen.
// Replaces the form on /details/customer. Addresses are assembled via an
// autocomplete field (street + number + postal code + city automatically).
// At the end, the answers are mapped onto the schema field IDs so they match
// the same data set as the installer page.
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

// --- Mock address database (later: Google Places / OSM Nominatim) ----------
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
    value: "Feed-in tariff pursuant to § 21 Abs. 1 EEG",
    label: "Fixed feed-in tariff",
    desc: "You receive a fixed amount per kilowatt-hour fed in. Simple & reliable.",
    icon: "💶",
  },
  {
    value: "Subsidized direct marketing (market premium) pursuant to § 20 EEG",
    label: "Direct marketing",
    desc: "Your electricity is sold on the exchange – more worthwhile for larger systems.",
    icon: "📈",
  },
  {
    value: "Free of charge offtake",
    label: "No compensation",
    desc: "You waive any compensation for the electricity fed in.",
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
          Change
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
          placeholder="Enter address, e.g. Sonnenallee…"
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
          No matches – try e.g. &bdquo;Musterstraße&ldquo; or &bdquo;Berlin&ldquo;.
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

  // Dynamic step list:
  // - "scan" step only in ID card mode
  // - "home" step is omitted when residence = system address
  const stepKeys = useMemo(() => {
    const keys = ["intro", "start"];
    if (a.mode === "upload") keys.push("scan");
    keys.push("name", "standort", "sameHome");
    if (a.sameHome === false) keys.push("home");
    keys.push("contact", "verguetung", "zaehler", "iban", "uis", "review");
    return keys;
  }, [a.mode, a.sameHome]);

  const key = stepKeys[stepIdx]!;
  const total = stepKeys.length - 1; // intro does not count toward progress
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
  // Jump to an already visited step (clickable navigation)
  function goto(i: number) {
    if (i <= maxStep) setStepIdx(Math.max(0, i));
  }

  // ID card recognized → apply name + system address, continue to home address
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

  // Switching to manual from the ID card step: current index then points to "name"
  function switchToManual() {
    set("mode", "manual");
  }

  // Per-step validation → controls the "Next" button
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
        return true; // intro, choice steps (auto-advance), iban (optional), review
    }
  })();

  function submit() {
    const home = a.sameHome === false ? a.home! : a.standort!;
    const payload = {
      orderId,
      filledBy: "customer",
      // Mapping onto the schema field IDs (ui_schema_pv.json)
      "1001": "Postal address",
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
      "1112": a.uisOk ? "Neither applies" : "",
      // Connecting party = system operator (default case "yourself")
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
            All done!
          </h1>
          <p className="mt-3 max-w-md text-slate-500">
            Your details have been submitted. Your installer will now add the
            technical data – you can track the progress at any time.
          </p>
          <Link
            href={`/orders/${orderId}/status`}
            className="mt-8 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            View status →
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
              Let&apos;s register your solar system
            </h1>
            <p className="mt-3 max-w-md text-lg text-slate-500">
              We&apos;ll ask you a few simple questions. It only takes 2 minutes –
              your installer handles the technical part.
            </p>
            <PrimaryButton onClick={next}>Let&apos;s go</PrimaryButton>
          </Center>
        )}

        {key === "start" && (
          <Question
            title="How would you like to start?"
            subtitle="Save yourself the typing – or enter everything yourself."
          >
            <ChoiceCards
              options={[
                {
                  value: "upload",
                  label: "Upload ID card",
                  desc: "We read your name and address automatically. Takes seconds.",
                  icon: "📷",
                },
                {
                  value: "manual",
                  label: "Enter manually",
                  desc: "You type in your data yourself, step by step.",
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
            title="Upload ID card"
            subtitle="A photo or scan of your ID card. We read your name and address automatically."
          >
            <IdScanStep onComplete={applyScan} onManual={switchToManual} />
          </Question>
        )}

        {key === "name" && (
          <Question
            title="What is your name?"
            subtitle="As the operator of the system."
          >
            <div className="flex flex-col gap-3">
              <TextInput
                autoFocus
                value={a.vorname}
                onChange={(v) => set("vorname", v)}
                placeholder="First name"
                onEnter={() => canProceed && next()}
              />
              <TextInput
                value={a.nachname}
                onChange={(v) => set("nachname", v)}
                placeholder="Last name"
                onEnter={() => canProceed && next()}
              />
            </div>
          </Question>
        )}

        {key === "standort" && (
          <Question
            title="Where will the system be installed?"
            subtitle="Type the address – we fill in the postal code and city automatically."
          >
            <AddressPicker
              value={a.standort}
              onSelect={(addr) => set("standort", addr)}
            />
          </Question>
        )}

        {key === "sameHome" && (
          <Question title="Do you live at this address?">
            <ChoiceCards
              options={[
                { value: "yes", label: "Yes, I live here", icon: "🏡" },
                { value: "no", label: "No, different address", icon: "📮" },
              ]}
              onPick={(v) => {
                set("sameHome", v === "yes");
                next();
              }}
            />
          </Question>
        )}

        {key === "home" && (
          <Question title="What is your home address?">
            <AddressPicker
              value={a.home}
              onSelect={(addr) => set("home", addr)}
            />
          </Question>
        )}

        {key === "contact" && (
          <Question
            title="How can we reach you?"
            subtitle="For questions and status notifications."
          >
            <div className="flex flex-col gap-3">
              <TextInput
                autoFocus
                type="tel"
                value={a.phone}
                onChange={(v) => set("phone", v)}
                placeholder="Phone number"
              />
              <TextInput
                type="email"
                value={a.email}
                onChange={(v) => set("email", v)}
                placeholder="Email address"
                onEnter={() => canProceed && next()}
              />
            </div>
          </Question>
        )}

        {key === "verguetung" && (
          <Question
            title="How would you like to be paid for your electricity?"
            subtitle="Don't worry – this can be adjusted later."
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
            title="What is your meter number?"
            subtitle="You'll find it on your electricity bill or on the front of the meter."
          >
            <TextInput
              autoFocus
              value={a.zaehler}
              onChange={(v) => set("zaehler", v)}
              placeholder="e.g. 1ESY1234567890"
              mono
              onEnter={() => canProceed && next()}
            />
          </Question>
        )}

        {key === "iban" && (
          <Question
            title="Where should we transfer the feed-in compensation?"
            subtitle="Optional – you can add this later."
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
            title="A quick confirmation"
            subtitle="We need to know this for the EEG subsidy."
          >
            <ChoiceCards
              options={[
                {
                  value: "ok",
                  label: "I confirm",
                  desc: "Not a company in difficulty, no outstanding recovery claims.",
                  icon: "✅",
                },
                {
                  value: "no",
                  label: "Does not apply",
                  desc: "My case is different – please clarify later.",
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
            title="Does everything look right?"
            subtitle="You can still change any item using the back arrow."
          >
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              <Row label="Name" value={`${a.vorname} ${a.nachname}`} />
              <Row
                label="System location"
                value={a.standort ? fmt(a.standort) : "—"}
              />
              <Row
                label="Home address"
                value={
                  a.sameHome === false && a.home
                    ? fmt(a.home)
                    : "same as system location"
                }
              />
              <Row label="Contact" value={`${a.phone} · ${a.email}`} />
              <Row label="Compensation" value={a.verguetung ?? "—"} />
              <Row label="Meter number" value={a.zaehler || "—"} />
              <Row label="IBAN" value={a.iban || "—"} />
            </dl>
          </Question>
        )}
      </div>

      {/* Footer action (not on auto-advance steps) */}
      {!["intro", "start", "scan", "sameHome", "verguetung", "uis"].includes(
        key,
      ) && (
        <div className="mt-8 flex justify-center">
          {key === "review" ? (
            <PrimaryButton onClick={submit}>Submit details ✓</PrimaryButton>
          ) : (
            <PrimaryButton onClick={next} disabled={!canProceed}>
              {key === "iban" && a.iban.trim() === "" ? "Skip" : "Next"}
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
          {/* View tabs & back button */}
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
                aria-label="Back"
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

          {/* Clickable step navigation */}
          {nav && <div className="mt-3">{nav}</div>}
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}

// Clickable chips for visited steps – jump back & edit.
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

// ID card upload with (mock) automatic extraction of name + address.
// Later: real OCR or LLM vision (fits LZ5 – automated check).
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
    // Demo: simulated extraction. Call a Vision API / OCR here later.
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
          Reading ID card…
        </p>
        <p className="text-xs text-slate-500">
          Name and address are detected automatically.
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
          Select ID card
        </span>
        <span className="text-sm text-slate-500">
          Take a photo or upload a file (front &amp; back)
        </span>
      </label>
      <p className="text-center text-xs text-slate-400">
        Your data is only used to pre-fill the fields.
      </p>
      <button
        type="button"
        onClick={onManual}
        className="text-center text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        Rather enter manually →
      </button>
    </div>
  );
}
