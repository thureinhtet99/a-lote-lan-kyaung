import { getMostRecentJobListingDb } from "@/features/jobListings/db/jobListings";
import { APP_ROUTES } from "@/config/appConfig";
import { idTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const SuspendedPage = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  // Get most recent job listings (cached)
  const cachedData = unstable_cache(
    async () => await getMostRecentJobListingDb(orgId),
    [orgId],
    {
      tags: [idTag("organizations", orgId)],
    }
  );

  const recentJobListing = await cachedData();
  if (recentJobListing == null)
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTING_NEW}`);
  else redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTING}/${recentJobListing.id}`);
};

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}
