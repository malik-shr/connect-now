# 🤖 AI Agent & Automation Interface Guide (`connect-now`)

Welcome to the Agent integration handbook for **connect-now**. This repository leverages Next.js App Router and a pure file-based configuration architecture to implement the digital grid connection interface **Data Set 3.0 (Datenset 3.0)**.

Because this workspace operates in **Mock Mode** without a persistent database backend, this document provides autonomous agents, LLM tool-calling processes, or mock seed scripts with instructions on how to interface with our code and styling mechanics.

---

## 🏗️ Technical Context for Agents

- **Frontend/Backend Architecture:** Next.js Server Components handle data ingestion directly. Forms pass raw payloads directly into asynchronous Server Actions (`"use server"`) located in page entry points.
- **Form Layout Protocol:** The form is generated dynamically by mapping an array-based JSON configuration.
- **Dynamic Routing Syntax:** Dynamic paths utilize a Promise-wrapped Next.js 15 routing rule: `/orders/[orderId]/details`.

---

## 📂 System File Dependencies

Agents must observe or manipulate data inside these specific paths:

| File Path | Description | Access Mode |
| :--- | :--- | :--- |
| `src/app/orders/[orderId]/details/ui_schema_pv.json` | Contains the complete field mapping array (IDs, validation states, labels, units). | **Read-Only** |
| `src/app/orders/[orderId]/details/page.tsx` | The core component engine that handles structural layout rendering and server-side processing. | **Read-Only** |
| `src/styles/globals.css` | The styling root directory initializing the Tailwind CSS engine. | **Read/Write** |
| Next.js Terminal Runtime Logs | Outputs the final compiled JSON payload from the form action. | **Write/Append Target** |

---

## 🛠️ Data Ingestion & Form Injection (Payload Layout)

When mocking payloads, generating automated test queries, or building validation tools, agents must process form attributes mapping directly to the `id` parameters inside `ui_schema_pv.json`. 

### Expected Output Payload Shape
When the server action `submitGridData` triggers, it compiles form data into a flat `Record<string, any>` dictionary where keys correspond to stringified numerical IDs. 

Ensure your mock data generators follow this format:

```json
{
  "1001": "postalische Adresse",
  "1002": "Musterstraße",
  "1003": "42",
  "1007": "06108",
  "1008": "Halle (Saale)",
  "1101": "Musterfirma GmbH",
  "1110": "install@connect-now.io",
  "2001": "Stromspeicher",
  "3001": "Überschusseinspeisung",
  "3101": "12.5", 
  "3201": true
}