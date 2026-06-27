# connect-now

> Digital grid-connection workspace for solar (PV) installations — turning the paper-and-email grid application process into a transparent, real-time, multi-party workflow.

Built as a prototype at the 28h **Startup Elevator Energy Hackathon 2026** by **Team bitroot**.

---

## The Problem

Connecting a new PV installation to the public grid in Germany is slow and opaque. Operators like **NetzHalle** / **EVH (Energieversorgung Halle)** receive applications as scattered emails, PDFs, and incomplete forms. Three bottlenecks dominate:

- **Data Ping-Pong** — applications bounce back and forth between customer, installer, and grid operator because documents are incomplete or invalid on submission.
- **Status Silos** — the applicant (the *Anlagenbetreiber*) is left in the dark; there is no single source of truth for "who has the ball" right now.
- **Role Gaps** — installers hold the technical data, customers hold the signatures, and grid operators need a validated package — but no shared workspace connects them.

The result: a grid connection that should be straightforward takes **months** of back-and-forth.

## The Solution

**connect-now** is a shared workspace that brings the three parties — **Customer**, **certified Installer**, and **Grid Operator (VNB)** — onto one transparent timeline. Documents are co-authored and pre-validated *before* submission, status is live for everyone, and the grid operator approves a clean, standards-compliant package in one click.

It is modeled on the official German digital grid-connection standard **Data Set 3.0 (Datenset 3.0 / VDE)** so submissions match what operators like NetzHalle and EVH Halle actually need.

**Impact target:** time-to-grid-connection cut from **~6 months** to **~6 days** via straight-through digital processing.

## Key Features

- **Role-aware UI** — a single app that adapts to three personas with strict data isolation (each customer only sees their own projects; each installer only sees assigned ones).
- **Live status portal** — an interactive timeline showing exactly which party is responsible at each step, and which documents are still missing.
- **Shared chat workspace** — customer and installer collaborate in real time, exchange signed documents, and the project status updates automatically (e.g. `In Prüfung` → `Genehmigt`).
- **Pre-validated submissions** — a Data Set 3.0–aligned form and document checklist act as a digital buffer so the grid operator receives only complete requests.
- **VNB dashboard** — connected-capacity charts, processing times, and one-click approvals for the grid operator.

## Personas (demo logins)

The prototype runs in **mock mode** with three seeded roles:

| Role | Persona | Login |
| :--- | :--- | :--- |
| Customer (Anlagenbetreiber) | Kunde 1 | `user1@connect-now.io` |
| Installer (Zertifizierter Fachpartner) | Max Weber | `install@connect-now.io` |
| Grid Operator (VNB) | Dr. Andrea Kraft | `admin@connect-now.io` |

See [user_stories_presentation.md](user_stories_presentation.md) for the full demo script and pitch.

## Tech Stack

Bootstrapped with the [T3 Stack](https://create.t3.gg/):

- **[Next.js 15](https://nextjs.org)** (App Router, Server Components & Server Actions, Turbopack)
- **[React 19](https://react.dev)** + **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com)**

## Architecture Notes

- Forms are generated dynamically by mapping a JSON UI schema (`src/app/orders/[orderId]/details/ui_schema_pv.json`) and submit raw payloads directly into asynchronous Server Actions.
- Dynamic routing follows the Next.js 15 promise-wrapped convention, e.g. `/orders/[orderId]/details`.
- See [AGENTS.md](AGENTS.md) for the agent/automation integration guide and the Data Set 3.0 payload shape.

## Getting Started

Requirements: Node.js (with `npm`).

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env

# 3. Start the dev server (Turbopack)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and sign in with one of the demo personas above.

### Useful scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run check` | Lint + TypeScript type-check |
| `npm run format:write` | Format with Prettier |

## Team

Made with ⚡ by **Team bitroot** at the **Startup Elevator Energy Hackathon 2026**.

> Prototype / proof-of-concept — not production software.
