import EmployerLoading from "@/app/(routes)/employer/loading";
import { Card, CardContent } from "@/components/ui/card";
import JobListingForm from "@/components/job-listings/job-listing-form";
import { getJobListingByIdByOrgIdDb } from "@/features/job-listings/db/job-listing-db";
import { isUUID } from "@/features/job-listings/lib/utils";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { ParamsType } from "@/types/index.type";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cacheTag, cacheLife } from "next/cache";

async function getCachedJobListingByOrg(jobListingId: string, orgId: string) {
  "use cache";
  cacheTag("job-listing-" + jobListingId + "-org-" + orgId);
  cacheLife("hours");
  return await getJobListingByIdByOrgIdDb(jobListingId, orgId);
}

export default function EditJobListingPage(props: ParamsType) {
  return (
    <Suspense fallback={<EmployerLoading />}>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

const SuspendedComponent = async ({ params }: ParamsType) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  const { jobListingId } = await params;
  if (!isUUID(jobListingId)) notFound();

  // Get job listing by id by organization id (cached)
  const jobListing = await getCachedJobListingByOrg(jobListingId, orgId);
  if (jobListing == null) return notFound();

  return (
    <div className="max-w-6xl mx-auto p-4">
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
