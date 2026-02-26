import { Card, CardContent } from "@/components/ui/card";
import { APP_ROUTES } from "@/constants/app-config";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import JobListingForm from "@/features/job-listings/components/job-listing-form";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";
import PageLoading from "@/components/shared/page-loading";
import { getJobListingsByOrgId } from "@/features/job-listings/db/job-listing-db";

export default function NewJobListingPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.EMPLOYER.ORG);

  const jobListings = await getJobListingsByOrgId(orgId);
  if (!jobListings.success) return redirect(APP_ROUTES.EMPLOYER.ORG);

  return (
    <div className="max-w-7xl mx-auto p-4 @container">
      <h1 className="text-2xl font-bold mb-2">
        {jobListings.data.length === 0 &&
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
