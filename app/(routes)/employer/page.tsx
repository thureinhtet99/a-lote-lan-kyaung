import { getMostRecentJobListing } from "@/features/job-listings/db/job-listing-db";
import { APP_ROUTES } from "@/constants/app-config";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { cacheLife, cacheTag } from "next/cache";
import PageLoading from "@/components/shared/page-loading";
import { jobListingsTag } from "@/lib/utils/data-cache";

export default function EmployerHomePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();

  // Redirect to organizations page if no active organization
  if (orgId == null) {
    redirect(APP_ROUTES.EMPLOYER.ORG);
  }

  const jobListing = await getMostRecentJobListing(orgId);
  if (!jobListing || !jobListing.data?.id) {
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  }

  // Get most recent job listings (cached)
  const recentJobListing = await getMostRecentJobListing(orgId);
  if (!recentJobListing) redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`);
  else
    redirect(
      `${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${recentJobListing.data?.id}`,
    );
};
