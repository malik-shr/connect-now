import { redirect } from "next/navigation";
import Link from "next/link";

async function createProject(formData: FormData) {
  "use server";

  const projectName = formData.get("project_name");

  // Basic validation fallback for empty entries
  if (
    !projectName ||
    typeof projectName !== "string" ||
    projectName.trim() === ""
  ) {
    redirect("/register?error=invalid_name");
  }

  // Redirect cleanly to our dynamic dataset wizard form
  redirect(`/orders/${encodeURIComponent(projectName.trim())}`);
}

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header Navigation */}
      <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-base font-black text-white">
              ⚡
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              connect<span className="text-blue-600">now</span>
            </span>
          </Link>
          <Link
            href="/orders"
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Back to Orders
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex flex-grow items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Header Block */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Initialize Connection Request
            </h1>
            <p className="text-sm text-slate-500">
              Create a sandbox reference ID to start filling out the VDE Data
              Set 3.0 grid application forms.
            </p>
          </div>

          {/* Registration Form */}
          <form action={createProject} className="space-y-6">
            <div className="space-y-1.5">
              <label
                htmlFor="project_name"
                className="text-xs font-semibold tracking-wider text-slate-500 uppercase"
              >
                Project Identifier / Reference ID
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-sm text-slate-400 select-none">#</span>
                </div>
                <input
                  type="text"
                  name="project_name"
                  id="project_name"
                  required
                  placeholder="e.g., PV-Solar-2026"
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pr-3 pl-8 font-mono text-sm font-bold transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <p className="text-[11px] leading-tight text-slate-400">
                Spaces and special characters will be automatically safety
                encoded into a valid browser route slug string.
              </p>
            </div>

            {/* Information Callout Box */}
            <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-800">
                <span>ℹ️</span>
                <span>Mock Sandboxing Environment</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-900/80">
                Since database tracking is configured in transient memory,
                registering a new identifier instantly provisions a unique URL
                link routing directly into the rendering parser context.
              </p>
            </div>

            {/* Primary CTA Submission Button */}
            <button
              type="submit"
              className="block w-full transform cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none active:translate-y-0"
            >
              Generate Project Blueprint →
            </button>
          </form>
        </div>
      </main>

      {/* Basic Footer Element */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        connect-now sandbox engine • Data Set 3.0 Compliance Layer
      </footer>
    </div>
  );
}
