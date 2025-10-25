"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { insertUser } from "@/features/users/db/users";
import { toast } from "sonner";

// This component will run on the client side and sync the user data with db
export function UserDatabaseSync() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && userId && user) {
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
        } catch (error) {
          toast.error(error instanceof Error && error.message);
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, userId, user]);

  // This component doesn't render anything
  return null;
}
