import { getMostRecentJobListingDb } from "@/features/jobListings/db/job-listing-db";
import { APP_ROUTES } from "@/config/appConfig";
import { jobListingIdTag } from "@/lib/dataCache";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import EmployerLoading from "./loading";
import { getCurrentOrg } from "@/lib/auth-helpers";

export default function EmployerHomePage() {
  return (
    <Suspense fallback={<EmployerLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  const jobListing = await getMostRecentJobListingDb(orgId);
  if (!jobListing || !jobListing.id) {
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  }

  // Get most recent job listings (cached)
  const cachedData = unstable_cache(
    async () => await getMostRecentJobListingDb(orgId),
    [jobListingIdTag(orgId, "jobListings", jobListing.id)],
    {
      tags: [jobListingIdTag(orgId, "jobListings", jobListing.id)],
    },
  );

  const recentJobListing = await cachedData();
  if (recentJobListing == null)
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  else redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${recentJobListing.id}`);
};
