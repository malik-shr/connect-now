"use client";

import { useAuth } from "~/app/_context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/login?redirect=/admin");
      } else if (user?.role !== "admin") {
        // Not an admin, route back to projects
        router.push("/orders");
      }
    }
  }, [loading, isLoggedIn, user, router]);

  if (loading || !isLoggedIn || user?.role !== "admin") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-red-500/20 animate-ping" />
          <div className="relative h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-xl text-red-600 shadow-xs">
            ⚡
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-sm font-bold text-slate-800">Operator Compliance Check...</h2>
          <p className="text-[11px] text-slate-400">Verifying VNB grid operator clearances for this workspace.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
