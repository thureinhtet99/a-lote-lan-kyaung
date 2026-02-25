import ActionButton from "@/components/shared/action-button";
import CheckCondition from "@/components/shared/check-condition";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteJobListing } from "@/features/job-listings/actions";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import { isUUID } from "@/features/job-listings/lib/utils";
import { APP_ROUTES } from "@/constants/app-config";
import { EditIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import ApplicationTable from "@/features/applications/components/application-table";
import { MarkdownPartial } from "@/components/markdown/markdown-partial";
import JobListingBadges from "@/components/job-listings/job-listing-badges";
import { ParamsType } from "@/types/index.type";
import SkeletonApplicationTable from "@/features/applications/components/skeleton-application-table";
import EmployerLoading from "../../loading";
import { getJobListingByIdByOrgIdDb } from "@/features/job-listings/db/job-listing-db";
import StatusToggleButton from "@/components/organizations/status-toggle-button";
import FeatureToggleButton from "@/components/organizations/feature-toggle-button";
import Loading from "@/components/shared/loading";
import { getJobListingApplicationsDb } from "@/features/applications/db/job-listing-application-db";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { cacheTag, cacheLife } from "next/cache";

async function getCachedJobListingByOrg(jobListingId: string, orgId: string) {
  "use cache";
  cacheTag("job-listing-" + jobListingId + "-org-" + orgId);
  cacheLife("hours");
  return await getJobListingByIdByOrgIdDb(jobListingId, orgId);
}

async function getCachedJobListingApplications(jobListingId: string) {
  "use cache";
  cacheTag("job-listing-applications-" + jobListingId);
  cacheLife("minutes");
  return await getJobListingApplicationsDb(jobListingId);
}

export default function JobListingByIdPage(props: ParamsType) {
  return (
    <Suspense fallback={<EmployerLoading />}>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

const SuspendedComponent = async ({ params }: ParamsType) => {
  const { jobListingId } = await params;
  if (!isUUID(jobListingId)) notFound();

  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  // Get job listing by id by organization id (cached)
  const jobListing = await getCachedJobListingByOrg(jobListingId, orgId);
  if (jobListing == null) return notFound();

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>

          <div className="flex flex-wrap gap-2 mt-2">
            {/* Custom Badge */}
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>

        <div className="flex items-center gap-2 empty:-mt-4">
          {/* Edit button */}
          <CheckCondition
            condition={() => hasOrgUserPermission("job_listing.update")}
          >
            <Button asChild variant="outline">
              <Link
                href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${jobListing.id}/edit`}
              >
                <EditIcon className="size-4" />
                Edit
              </Link>
            </Button>
          </CheckCondition>

          {/* Status button */}
          <Suspense
            fallback={
              <Button variant="outline" disabled>
                <Loading />
              </Button>
            }
          >
            <StatusToggleButton status={jobListing.status} id={jobListing.id} />
          </Suspense>

          {/* Feature button */}
          {jobListing.status === "published" && (
            <FeatureToggleButton
              isFeatured={jobListing.isFeatured}
              id={jobListing.id}
            />
          )}

          {/* Delete button */}
          <CheckCondition
            condition={() => hasOrgUserPermission("job_listing.delete")}
          >
            <ActionButton
              action={deleteJobListing.bind(null, jobListing.id)}
              variant="destructive"
              areYouSure
            >
              <Trash2Icon className="size-4" />
            </ActionButton>
          </CheckCondition>
        </div>
      </div>

      {/* Markdown partial */}
      <MarkdownPartial
        dialogMarkdown={
          <MarkdownRenderer source={jobListing.description ?? ""} />
        }
        mainMarkdown={
          <MarkdownRenderer source={jobListing.description ?? ""} />
        }
      />

      <Separator />

      <h2 className="text-xl font-semibold">Applications</h2>
      <Suspense fallback={<SkeletonApplicationTable />}>
        <Applications jobListingId={jobListingId} />
      </Suspense>
    </div>
  );
};

const Applications = async ({ jobListingId }: { jobListingId: string }) => {
  // Fetch applications by jobListingId from db (cached)
  const applications = await getCachedJobListingApplications(jobListingId);

  return (
    <ApplicationTable
      applications={applications.map((app) => ({
        ...app,
        createdAt: app.created_at,
        user: {
          ...app.user,
          resume: app.user.resume
            ? {
                ...app.user.resume,
                markdownSummary: app.user.resume.resumeFileUrl ? ( // replace resumeFileUrl wit aiSummary later
                  <MarkdownRenderer source={app.user.resume.resumeFileUrl} />
                ) : null,
              }
            : null,
        },
        coverLetterMarkDown: app.coverLetter ? (
          <MarkdownRenderer source={app.coverLetter} />
        ) : null,
      }))}
      canUpdateRating={await hasOrgUserPermission("application.change_rating")}
      canUpdateStatus={await hasOrgUserPermission("application.change_status")}
    />
  );
};
