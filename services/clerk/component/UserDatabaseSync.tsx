"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { insertUser } from "@/features/users/db/users";

// This component will run on the client side and sync the user data with our database
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
            image: user.imageUrl,
          });
        } catch (error) {
          console.error("Error syncing user with database:", error);
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, userId, user]);

  // This component doesn't render anything
  return null;
}
