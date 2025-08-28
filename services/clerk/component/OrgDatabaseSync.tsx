"use client";

import { useEffect } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { insertOrg } from "@/features/organizations/db/organizations";

// This component will run on the client side and sync the user data with our database
export function OrgDatabaseSync() {
  const { orgId, isLoaded, isSignedIn } = useAuth();
  const { organization } = useOrganization();

  useEffect(() => {
    if (isLoaded && isSignedIn && orgId && organization) {
      const syncUser = async () => {
        try {
          await insertOrg({
            id: orgId,
            name: organization.name || "",
            image: organization.imageUrl || "",
          });
        } catch (error) {
          console.error("Error syncing organization with database:", error);
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, orgId, organization]);

  // This component doesn't render anything
  return null;
}
