import ActionButton from "@/components/shared/action-button";
import CheckCondition from "@/components/shared/check-condition";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import { APP_ROUTES } from "@/constants/app-config";
import { EditIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import ApplicationTable from "@/features/applications/components/application-table";
import { MarkdownPartial } from "@/components/markdown/markdown-partial";
import JobListingBadges from "@/features/job-listings/components/job-listing-badges";
import SkeletonApplicationTable from "@/features/applications/components/skeleton-application-table";
import {
  deleteJobListing,
  getJobListingByIdByOrgId,
} from "@/features/job-listings/db/job-listing-db";
import StatusToggleButton from "@/features/job-listings/components/status-toggle-button";
import FeatureToggleButton from "@/features/job-listings/components/feature-toggle-button";
import Loading from "@/components/shared/loading";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import PageLoading from "@/components/shared/page-loading";
import { getApplicationsByJobListingId } from "@/features/applications/db/application-db";

export default function JobListingPage({
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
  const { jobListingId } = await params;

  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  // Get job listing by id by organization id (cached)
  const jobListing = await getJobListingByIdByOrgId(jobListingId, orgId);
  if (!jobListing.data) return notFound();

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.data.title}
          </h1>

          <div className="flex flex-wrap gap-2 mt-2">
            {/* Custom Badge */}
            <Badge>{formatJobListingStatus(jobListing.data.status)}</Badge>
            <JobListingBadges jobListing={jobListing.data} />
          </div>
        </div>

        <div className="flex items-center gap-2 empty:-mt-4">
          {/* Edit button */}
          <CheckCondition
            condition={() => hasOrgUserPermission("job_listing.update")}
          >
            <Button asChild variant="outline">
              <Link
                href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${jobListing.data.id}/edit`}
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
            <StatusToggleButton
              status={jobListing.data.status}
              id={jobListing.data.id}
            />
          </Suspense>

          {/* Feature button */}
          {jobListing.data.status === "published" && (
            <FeatureToggleButton
              isFeatured={jobListing.data.isFeatured}
              id={jobListing.data.id}
            />
          )}

          {/* Delete button */}
          <CheckCondition
            condition={() => hasOrgUserPermission("job_listing.delete")}
          >
            <ActionButton
              action={deleteJobListing.bind(null, jobListing.data.id)}
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
          <MarkdownRenderer source={jobListing.data.description ?? ""} />
        }
        mainMarkdown={
          <MarkdownRenderer source={jobListing.data.description ?? ""} />
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
  const applications = await getApplicationsByJobListingId(jobListingId);

  return (
    <ApplicationTable
      applications={applications.data.map((app) => ({
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
