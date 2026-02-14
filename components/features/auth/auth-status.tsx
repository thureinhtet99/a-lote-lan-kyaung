"use client";

import Loading from "@/components/shared/loading";
import { useSession } from "@/lib/auth/auth-client";
import { ReactNode } from "react";

export function SignedIn({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <Loading />;
  if (!session) return null;

  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <Loading />;
  if (session) return null;

  return <>{children}</>;
}
