import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import JobListingForm from "@/features/jobListings/components/JobListingForm";
import { jobListingIdTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { ParamsType } from "@/types/params.type";
import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function EditJobListingPage(props: ParamsType) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

const SuspendedComponent = async ({ params }: ParamsType) => {
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

// Get job listing by org id
const getJobListingByOrgIdDb = async (id: string, orgId: string) => {
  return await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.organizationId, orgId)
    ),
  });
};
