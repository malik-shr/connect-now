"use client";

import { useAuth } from "~/app/_context/AuthContext";
import { use } from "react";
import AuthGuard from "~/app/_components/AuthGuard";

export default function CustomerDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (isLoggedIn && user?.role === "installer") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-red-500/20 animate-ping" />
          <div className="relative h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-xl text-red-600 shadow-xs">
            🛡️
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-sm font-bold text-slate-800 font-sans">Access Denied</h2>
          <p className="text-[11px] text-slate-400 font-sans px-4">
            As an installer, you do not have permission to access the customer profile forms for this project (#{orderId}).
          </p>
        </div>
      </div>
    );
  }

  return <AuthGuard>{children}</AuthGuard>;
}
