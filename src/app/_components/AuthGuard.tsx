"use client";

import { useAuth } from "~/app/_context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      // Redirect to login, adding redirect param
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isLoggedIn, router, pathname]);

  // Render matching loader skeleton during checks or redirect delays
  if (loading || !isLoggedIn) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        {/* Pulsing visual skeleton */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-blue-500/20 animate-ping" />
          <div className="relative h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-xl text-blue-600 shadow-xs">
            ⚡
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-sm font-bold text-slate-800">Security check...</h2>
          <p className="text-[11px] text-slate-400">Verifying permissions for this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
