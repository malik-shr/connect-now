"use client";

import AuthGuard from "~/app/_components/AuthGuard";

export default function RegisterProjectLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
