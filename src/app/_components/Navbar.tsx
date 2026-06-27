"use client";

import Link from "next/link";
import { useAuth } from "~/app/_context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

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
        <div className="flex items-center gap-1 sm:gap-2">
          {isLoggedIn && user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              VNB Portal
            </Link>
          )}
          {isLoggedIn && (
            <>
              <Link
                href="/orders"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                My Projects
              </Link>
              <Link
                href="/account"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Mein Konto
              </Link>
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
              <span className="text-xs font-bold text-slate-500 hidden md:inline">
                Hallo, {user?.firstName}
              </span>
              <div 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 select-none"
                title={`${user?.firstName} ${user?.lastName} (${user?.role})`}
              >
                {user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                Abmelden
              </button>
            </div>
          )}

          {(!isLoggedIn || user?.role === "member") && (
            <Link
              href="/register-project"
              className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:block"
            >
              New Grid Connection
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
