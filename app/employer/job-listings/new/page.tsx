import { Card, CardContent } from "@/components/ui/card";
import { APP_ROUTES } from "@/config/appConfig";
import JobListingForm from "@/features/jobListings/components/job-listing-form";
import { jobListingsTag } from "@/lib/dataCache";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import EmployerLoading from "../../loading";
import { getAllJobListingsDb } from "@/features/jobListings/db/job-listing-db";
import { getCurrentOrg } from "@/lib/auth-helpers";
import { hasOrgUserPermission } from "@/lib/permission";

export default function NewJobListingPage() {
  return (
    <Suspense fallback={<EmployerLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.ORG.HOME);

  // Get all job listings (cached)
  const cachedData = unstable_cache(
    async () => await getAllJobListingsDb(orgId),
    [jobListingsTag(orgId, "jobListings")],
    {
      tags: [jobListingsTag(orgId, "jobListings")],
    },
  );

  const jobListings = await cachedData();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">
        {jobListings.length === 0 &&
        (await hasOrgUserPermission("job_listing.create"))
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
