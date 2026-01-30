import { ensureOrganizationExists } from "@/services/clerk/lib/sync-organization";
import { ReactNode } from "react";

type OrganizationSyncWrapperProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Server component that ensures the current organization is synced to the database
 * This runs on the server and only when needed (if org doesn't exist in DB)
 */
export default async function OrganizationSyncWrapper({
  children,
  fallback,
}: OrganizationSyncWrapperProps) {
  try {
    const result = await ensureOrganizationExists();

    if (!result.success) {
      console.warn("Organization sync warning:", result.message);
      // Don't block rendering for sync failures
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Organization sync error:", error);

    // Don't block rendering, return fallback or children
    return <>{fallback || children}</>;
  }
}
