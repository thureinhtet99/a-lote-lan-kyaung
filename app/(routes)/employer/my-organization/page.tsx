import { Suspense } from "react";
import OrganizationsClient from "../../../../features/organizations/components/_organizations-client";
import { getOrganizationsByEmployerId } from "@/features/organizations/db/organization-db";
import PageLoading from "@/components/shared/page-loading";

export default function MyOrganizationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const organizations = await getOrganizationsByEmployerId();

  // Employers can only have one organization, so take the first one
  const organization =
    organizations.data.length > 0 ? (organizations.data[0] as any) : null;

  return <OrganizationsClient organization={organization} />;
};
