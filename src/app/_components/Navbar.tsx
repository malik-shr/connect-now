import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-base font-black text-white">
            ⚡
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            connect<span className="text-blue-600">now</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/orders"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            My Projects
          </Link>
          <Link
            href="/register-project"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            New Grid Connection
          </Link>
        </div>
      </div>
    </nav>
  );
}
