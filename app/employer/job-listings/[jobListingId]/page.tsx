import ActionButton from "@/components/ActionButton";
import CheckCondition from "@/components/CheckCondition";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteJobListing } from "@/features/jobListings/actions";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { isUUID } from "@/features/jobListings/lib/utils";
import { APP_ROUTES } from "@/config/appConfig";
import { jobListingApplicationsTag, jobListingIdTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/get-current-auth";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permission";
import { EditIcon, Trash2Icon } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import ApplicationTable from "@/features/jobListingApplications/components/application-table";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import JobListingBadges from "@/features/jobListings/components/job-listing-badges";
import { ParamsType } from "@/types/index.type";
import SkeletonApplicationTable from "@/features/jobListingApplications/components/skeleton-application-table";
import EmployerLoading from "../../loading";
import { getJobListingByIdByOrgIdDb } from "@/features/jobListings/db/job-listing-db";
import StatusToggleButton from "../../components/status-toggle-button";
import FeatureToggleButton from "../../components/feature-toggle-button";
import Loading from "@/components/loading";
import { getJobListingApplicationsDb } from "@/features/jobListingApplications/db/job-listing-application-db";

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
  const cachedData = unstable_cache(
    async () => await getJobListingByIdByOrgIdDb(jobListingId, orgId),
    [jobListingIdTag(orgId, "jobListings", jobListingId)],
    {
      tags: [jobListingIdTag(orgId, "jobListings", jobListingId)],
    },
  );

  const jobListing = await cachedData();
  if (jobListing == null) return notFound();

  return (
    <div className="space-y-8 max-w-8xl mx-auto p-4 @container">
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
            condition={() => hasOrgUserPermission("job_listing:update")}
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
            condition={() => hasOrgUserPermission("job_listing:delete")}
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
  const cachedData = unstable_cache(
    async () => await getJobListingApplicationsDb(jobListingId),
    [jobListingApplicationsTag("jobListingApplications", jobListingId)],
    {
      tags: [jobListingApplicationsTag("jobListingApplications", jobListingId)],
    },
  );

  const applications = await cachedData();

  return (
    <ApplicationTable
      applications={applications.map((app) => ({
        ...app,
        user: {
          ...app.user,
          resume: app.user.resume
            ? {
                ...app.user.resume,
                markdownSummary: app.user.resume.aiSummary ? (
                  <MarkdownRenderer source={app.user.resume.aiSummary} />
                ) : null,
              }
            : null,
        },
        coverLetterMarkDown: app.coverLetter ? (
          <MarkdownRenderer source={app.coverLetter} />
        ) : null,
      }))}
      canUpdateRating={await hasOrgUserPermission(
        "job_listing_application:change_rating",
      )}
      canUpdateStatus={await hasOrgUserPermission(
        "job_listing_application:change_status",
      )}
    />
  );
};
