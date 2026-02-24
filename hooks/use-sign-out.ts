"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { APP_ROUTES } from "@/constants/app-config";
import { useState } from "react";

export function useSignOut() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          router.push(APP_ROUTES.HOME);
        },
      },
    });
  };

  return { signOut, isLoading };
}
