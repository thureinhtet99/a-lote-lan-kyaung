import { Suspense } from "react";
import MyOrganizationClient from "@/features/organizations/components/_my-organization-client";
import {
  getActiveOrganization,
  getOrganizationsByEmployerId,
} from "@/features/organizations/db/organization-db";
import PageLoading from "@/components/shared/page-loading";

export default function MyOrganizationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  // Get active organization from session
  const activeOrgResult = await getActiveOrganization();
  const activeOrganization = activeOrgResult.data;

  // Get all organizations user is a member of
  const allOrgsResult = await getOrganizationsByEmployerId();
  const availableOrganizations = allOrgsResult.data;

  return (
    <MyOrganizationClient
      activeOrganization={activeOrganization as any}
      availableOrganizations={availableOrganizations as any}
    />
  );
};
