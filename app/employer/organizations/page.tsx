import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getUserOrganizationsDb } from "@/features/organizations/actions/manage-organizations";
import { idTag } from "@/lib/utils/dataCache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Loading from "@/components/shared/loading";
import OrganizationsClient from "./organizations-client";

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
  role: string;
}

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
    return null;
  }

  // Get user's organizations with caching
  const cachedOrganizations = unstable_cache(
    async (userId: string) => await getUserOrganizationsDb(userId),
    [idTag("organizations", session.user.id)],
    {
      tags: [idTag("organizations", session.user.id)],
    },
  );

  const organizations = (await cachedOrganizations(
    session.user.id,
  )) as Organization[];

  return <OrganizationsClient organizations={organizations} />;
};
