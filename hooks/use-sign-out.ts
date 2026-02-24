"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { APP_ROUTES } from "@/constants/app-config";
import { useTransition } from "react";

export function useSignOut() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signOut = async ({
    onSuccess,
  }: {
    onSuccess?: () => void;
  } = {}) => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          startTransition(() => {
            onSuccess?.();
            router.push(APP_ROUTES.HOME);
          });
        },
      },
    });
  };

  return { signOut, isPending };
}
