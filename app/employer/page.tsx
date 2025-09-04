import { getMostRecentJobListingDb } from "@/features/jobListings/db/jobListings";
import { APP_ROUTES } from "@/lib/appConfig";
import { getIdTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { unstable_cache } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

const SuspendedPage = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  const cachedData = unstable_cache(
    async () => getMostRecentJobListingDb(orgId),
    [orgId],
    {
      tags: [getIdTag("organizations", orgId)],
    }
  );

  const jobListing = await cachedData();
  if (jobListing == null) return notFound();

  const recentJobListing = await getMostRecentJobListingDb(orgId);
  if (recentJobListing == null) {
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTING}/new`);
  } else {
    redirect(`${APP_ROUTES.EMPLOYER.JOB_LISTING}/${recentJobListing.id}`);
  }
};

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}
