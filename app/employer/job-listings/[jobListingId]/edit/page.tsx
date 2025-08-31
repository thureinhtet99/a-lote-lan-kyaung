import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { JobListingForm } from "@/features/jobListings/components/JobListingForm";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ParamsType = {
  params: Promise<{ jobListingId: string }>;
};

const getJobListingByOrgId = async (jobListingId: string) => {
  const result = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.id, jobListingId));

  return result[0];
};

const SuspendedPage = async ({ params }: ParamsType) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  const { jobListingId } = await params;
  const jobListing = await getJobListingByOrgId(jobListingId);
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
