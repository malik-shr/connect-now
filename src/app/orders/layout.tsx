"use client";

import AuthGuard from "~/app/_components/AuthGuard";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
