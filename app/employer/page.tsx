import { getMostRecentJobListingDb } from "@/features/jobListings/db/jobListings";
import { APP_ROUTES } from "@/config/appConfig";
import { idTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EmployerHomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  // Get most recent job listings (cached)
  const cachedData = unstable_cache(
    async () => await getMostRecentJobListingDb(orgId),
    [idTag("organizations", orgId)],
    {
      tags: [idTag("organizations", orgId)],
    }
  );

  const recentJobListing = await cachedData();
  if (recentJobListing == null)
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  else redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${recentJobListing.id}`);
};
