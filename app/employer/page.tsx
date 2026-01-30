import { getMostRecentJobListingDb } from "@/features/jobListings/db/job-listing-db";
import { APP_ROUTES } from "@/config/appConfig";
import { jobListingIdTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/components/Loading";

export default function EmployerHomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  const { id } = await getMostRecentJobListingDb(orgId);
  if (!id) {
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  }

  // Get most recent job listings (cached)
  const cachedData = unstable_cache(
    async () => await getMostRecentJobListingDb(orgId),
    [jobListingIdTag(orgId, "jobListings", id)],
    {
      tags: [jobListingIdTag(orgId, "jobListings", id)],
    },
  );

  const recentJobListing = await cachedData();
  if (recentJobListing == null)
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  else redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${recentJobListing.id}`);
};
