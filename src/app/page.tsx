import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 mx-auto max-w-7xl border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-base font-black tracking-tighter text-white">
              ⚡
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              connect<span className="text-blue-600">now</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              My Projects
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              New Grid Connection
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10 ring-inset">
            Digital Grid Connection • VDE Data Set 3.0 Standard
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:leading-tight">
            Accelerating grid connections, <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              completely digital.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500">
            With connect-now, asset operators, installers, and grid operators
            submit all structured configuration data for PV systems seamlessly
            according to the new compliance standard.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full transform rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto"
            >
              Register Project
            </Link>
            <Link
              href="/orders"
              className="w-full rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            >
              View Existing Orders
            </Link>
          </div>
        </div>

        {/* Informational Grid Feature Blocks */}
        <section className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl text-blue-600">
              📝
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Data Set 3.0 Compliance
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Full structured parameters for PV modules, inverters, grid/plant
              protection (NA-Schutz), and master site address details matching
              VDE application rules.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xl text-indigo-600">
              🚀
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Streamlined Process
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Eliminate paper friction. Capture valid machine-readable data
              datasets on the spot to drastically compress internal evaluation
              times for utility operators.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-xl text-emerald-600">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Simple Mock Testing
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Optimized for sandbox reviews. Input data inside your interactive
              UI and verify the compiled request payload output safely inside
              your active Node terminal logs.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} connect-now. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0">
            Built on top of T3 Stack Core Framework Architecture.
          </p>
        </div>
      </footer>
    </div>
  );
}
