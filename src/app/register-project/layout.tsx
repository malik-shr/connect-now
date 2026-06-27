"use client";

import AuthGuard from "~/app/_components/AuthGuard";
import { useAuth } from "~/app/_context/AuthContext";

export default function RegisterProjectLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (isLoggedIn && user?.role !== "member") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-red-500/20 animate-ping" />
          <div className="relative h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-xl text-red-600 shadow-xs">
            ⚡
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-sm font-bold text-slate-800 font-sans">Access denied</h2>
          <p className="text-[11px] text-slate-400 font-sans">Only system operators can create new grid connection projects.</p>
        </div>
      </div>
    );
  }

  return <AuthGuard>{children}</AuthGuard>;
}
