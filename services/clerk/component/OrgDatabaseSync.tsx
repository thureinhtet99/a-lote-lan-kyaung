"use client";

import { useEffect } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { insertOrg } from "@/features/organizations/db/organizations";
import { toast } from "sonner";

// This component will run on the client side and sync user data with db
export default function OrgDatabaseSync() {
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
          toast.error(error instanceof Error && error.message);
        }
      };
      syncUser();
    }
  }, [isLoaded, isSignedIn, orgId, organization]);

  // This component doesn't render anything
  return null;
}
