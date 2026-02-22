import { Suspense } from "react";
import { getUserOrganizationsDb } from "@/features/organizations/actions/manage-organizations";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Loading from "@/components/shared/loading";
import OrganizationsClient from "./organizations-client";
import { cacheTag, cacheLife } from "next/cache";

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

async function getCachedUserOrganizations(userId: string) {
  "use cache";
  cacheTag("user-organizations-" + userId);
  cacheLife("hours");
  return await getUserOrganizationsDb(userId);
}

const SuspendedComponent = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  // Get user's organizations with caching
  const organizations = (await getCachedUserOrganizations(
    session.user.id,
  )) as Organization[];

  return <OrganizationsClient organizations={organizations} />;
};
