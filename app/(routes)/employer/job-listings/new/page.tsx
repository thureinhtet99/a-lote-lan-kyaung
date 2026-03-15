import PageLoading from "@/components/shared/page-loading";
import { APP_ROUTES } from "@/constants/app-config";
import JobListingForm from "@/features/job-listings/components/job-listing-form";
import { getJobListingsByOrgId } from "@/features/job-listings/db/job-listing-db";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function NewJobListingPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { orgId } = await getCurrentOrg();
  console.log("orgId", orgId);

  if (orgId == null) return redirect(APP_ROUTES.EMPLOYER.MY_ORG);

  const jobListings = await getJobListingsByOrgId(orgId);
  if (!jobListings.success) return redirect(APP_ROUTES.EMPLOYER.MY_ORG);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 @container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {jobListings.data.length === 0 &&
          (await hasOrgUserPermission("job_listing.create"))
            ? "Create your first job listing"
            : "New Job Listing"}
        </h1>
        <p className="text-muted-foreground mt-2">
          This does not post the job listing. It just saves a draft.
        </p>
      </div>

      <div>
        <JobListingForm />
      </div>
    </div>
  );
};
