"use client";

import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { insertUser } from "@/features/users/db/users";
import { toast } from "sonner";

// This component will run on the client side and sync the user data with db
export function UserDatabaseSync() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const lastSyncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !user) {
      return;
    }

    if (lastSyncedUserIdRef.current === userId) {
      return;
    }

    let isActive = true;

    const syncUser = async () => {
      try {
        await insertUser({
          id: userId,
          first_name: user.firstName || "",
          last_name: user.lastName || "",
          username: user.username || userId,
          email: user.primaryEmailAddress?.emailAddress || "",
          image: user.imageUrl || "",
        });

        if (isActive) {
          lastSyncedUserIdRef.current = userId;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sync user.";
        toast.error(message);
      }
    };

    syncUser();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn, userId, user]);

  // This component doesn't render anything
  return null;
}
