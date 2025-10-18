import { Card, CardContent } from "@/components/ui/card";
import JobListingForm from "@/features/jobListings/components/JobListingForm";
import { getJobListingByOrgIdDb } from "@/features/jobListings/db/jobListings";
import { jobListingIdTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ParamsType = {
  params: Promise<{ jobListingId: string }>;
};

const SuspendedPage = async ({ params }: ParamsType) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  const { jobListingId } = await params;

  // Get job listing by organization id (cached)
  const cachedData = unstable_cache(
    async () => getJobListingByOrgIdDb(jobListingId, orgId),
    [jobListingId, orgId],
    {
      tags: [jobListingIdTag(orgId, "jobListings", jobListingId)],
    }
  );

  const jobListing = await cachedData();
  if (jobListing == null) return notFound();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <p className="text-muted-foreground mb-6">
        This does not post the listing yet. It just saves a draft.
      </p>

      <Card>
        <CardContent>
          <JobListingForm jobListing={jobListing} />
        </CardContent>
      </Card>
    </div>
  );
};

export default function EditJobListingPage(props: ParamsType) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}
