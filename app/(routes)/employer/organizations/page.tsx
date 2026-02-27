import { Suspense } from "react";
import OrganizationsClient from "../../../../features/organizations/components/_organizations-client";
import { getOrganizationsByEmployerId } from "@/features/organizations/db/organization-db";
import PageLoading from "@/components/shared/page-loading";
import { safeGetSession } from "@/lib/auth/auth-helpers";

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const session = await safeGetSession();
  const activeOrganizationId = session?.session.activeOrganizationId ?? null;

  const organizations = await getOrganizationsByEmployerId();

  return (
    <OrganizationsClient
      organizations={organizations.data}
      activeOrganizationId={activeOrganizationId}
    />
  );
};
