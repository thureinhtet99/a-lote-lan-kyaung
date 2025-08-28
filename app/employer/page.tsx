import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { APP_ROUTES } from "@/lib/appConfig";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Fetch a most-recent-job from ORM and make cache
const getMostRecentJobListing = (orgId: string) => {
  const fetchMostRecentJobListingByOrgId = unstable_cache(
    async () => {
      return await db
        .select({ id: jobListingsTable.id })
        .from(jobListingsTable)
        .where(eq(jobListingsTable.organizationId, orgId))
        .orderBy(jobListingsTable.createdAt)
        .then((res) => res[0]);
    },
    [`jobListings-${orgId}`],
    {
      tags: [`jobListings-${orgId}`],
      revalidate: 3600, // 1 hour
    }
  );
  
  return fetchMostRecentJobListingByOrgId();
};

const SuspendedPage = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  const recentJobListing = await getMostRecentJobListing(orgId);
  if (recentJobListing == null) {
    redirect(`${APP_ROUTES.EMPLOYER_JOB_LISTING}/new`);
  } else {
    redirect(`${APP_ROUTES.EMPLOYER_JOB_LISTING}/${recentJobListing.id}`);
  }
};

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}
