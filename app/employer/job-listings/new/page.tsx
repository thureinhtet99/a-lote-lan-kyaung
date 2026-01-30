import Loading from "@/components/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { APP_ROUTES } from "@/config/appConfig";
import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import JobListingForm from "@/features/jobListings/components/JobListingForm";
import { jobListingsTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permission";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function NewJobListingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.ORG.SELECT);

  // Get all job listings (cached)
  const cachedData = unstable_cache(
    async () => await getAllJobListingsDb(orgId),
    [orgId],
    {
      tags: [jobListingsTag(orgId, "jobListings")],
    },
  );

  const jobListings = await cachedData();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">
        {jobListings.length === 0 &&
        (await hasOrgUserPermission("job_listing:create"))
          ? "Create your first job listing"
          : "New Job Listing"}
      </h1>
      <p className="text-muted-foreground mb-6">
        This does not post the job listing. It just saves a draft.
      </p>

      <Card>
        <CardContent>
          <JobListingForm />
        </CardContent>
      </Card>
    </div>
  );
};

const getAllJobListingsDb = async (orgId: string) => {
  return await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.organizationId, orgId));
};
