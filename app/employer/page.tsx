import { getMostRecentJobListingDb } from "@/features/job-listings/db/job-listing-db";
import { APP_ROUTES } from "@/constants/app-config";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import EmployerLoading from "./loading";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { cacheTag, cacheLife } from "next/cache";

export default function EmployerHomePage() {
  return (
    <Suspense fallback={<EmployerLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

async function getCachedMostRecentJobListing(orgId: string) {
  "use cache";
  cacheTag("job-listing-recent-" + orgId);
  cacheLife("hours");
  return await getMostRecentJobListingDb(orgId);
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();

  // Redirect to organizations page if no active organization
  if (orgId == null) {
    redirect(APP_ROUTES.EMPLOYER.ORG);
  }

  const jobListing = await getMostRecentJobListingDb(orgId);
  if (!jobListing || !jobListing.id) {
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  }

  // Get most recent job listings (cached)
  const recentJobListing = await getCachedMostRecentJobListing(orgId);
  if (recentJobListing == null)
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  else redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${recentJobListing.id}`);
};
