"use client";

import { useEffect, useRef } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { insertOrg } from "@/features/organizations/db/organizations";
import { toast } from "sonner";

// This component will run on the client side and sync org data with db
export default function OrgDatabaseSync() {
  const { orgId, isLoaded, isSignedIn } = useAuth();
  const { organization } = useOrganization();
  const syncedOrgsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isLoaded && isSignedIn && orgId && organization) {
      // Check if we've already synced this org in this session
      if (syncedOrgsRef.current.has(orgId)) {
        console.log("orgId",orgId);
        
        return;
      }

      const syncOrg = async () => {
        try {
          await insertOrg({
            id: orgId,
            name: organization.name || "",
            image: organization.imageUrl || "",
          });
          // Mark this org as synced for this session
          syncedOrgsRef.current.add(orgId);
          console.log("org synced:", orgId);
        } catch (error) {
          toast.error(error instanceof Error && error.message);
        }
      };
      syncOrg();
    }
  }, [isLoaded, isSignedIn, orgId, organization]);

  // This component doesn't render anything
  return null;
}
