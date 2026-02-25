import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Loading from "@/components/shared/loading";
import OrganizationsClient from "../../../../features/organizations/components/organizations-client";
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";
import { getOrganizationsByEmployerId } from "@/features/organizations/db/organization-db";

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect(APP_ROUTES.SIGN_IN);
  }
  const userId = session.session.userId;
  const activeOrganizationId = session.session.activeOrganizationId ?? null;
  const { data } = await getOrganizationsByEmployerId();

  return (
    <OrganizationsClient
      organizations={data}
      userId={userId}
      activeOrganizationId={activeOrganizationId}
    />
  );
};
