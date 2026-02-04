"use client";

import { useSession } from "@/lib/auth-client";
import { ReactNode } from "react";

export function SignedIn({ children }: { children: ReactNode }) {
  const session = useSession();

  if (!session.data) {
    return null;
  }

  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const session = useSession();

  if (session.data) {
    return null;
  }

  return <>{children}</>;
}
