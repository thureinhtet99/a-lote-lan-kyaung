"use client";

import { useSignOut } from "@/hooks/use-sign-out";

export function SignOutButton({ children }: { children: React.ReactNode }) {
  const { signOut } = useSignOut();

  return <div onClick={() => signOut()}>{children}</div>;
}
