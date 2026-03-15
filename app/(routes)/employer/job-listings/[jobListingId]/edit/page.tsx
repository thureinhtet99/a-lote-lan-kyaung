import { Card, CardContent } from "@/components/ui/card";
import JobListingForm from "@/features/job-listings/components/job-listing-form";
import { getJobListingByIdByOrgId } from "@/features/job-listings/db/job-listing-db";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageLoading from "@/components/shared/page-loading";

export default function EditJobListingPage({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent params={params} />
    </Suspense>
  );
}

const SuspendedComponent = async ({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  const { jobListingId } = await params;

  // Get job listing by id by organization id (cached)
  const jobListing = await getJobListingByIdByOrgId(jobListingId, orgId);
  if (!jobListing.data) return notFound();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 @container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job Listing</h1>
        <p className="text-muted-foreground mt-2">
          This does not post the listing yet. It just saves a draft.
        </p>
      </div>

      <Card>
        <CardContent>
          <JobListingForm jobListing={jobListing.data} />
        </CardContent>
      </Card>
    </div>
  );
};
