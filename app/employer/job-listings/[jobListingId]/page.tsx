import ActionButton from "@/components/ActionButton";
import CheckCondition from "@/components/CheckCondition";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  jobListingApplicationsTable,
  jobListingsTable,
  JobListingStatusType,
} from "@/drizzle/schema";
import {
  deleteJobListing,
  toggleJobListingFeaturedStatus,
  toggleJobListingStatus,
} from "@/features/jobListings/actions/actions";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/features/jobListings/lib/planFeatureHelpers";
import { nextJobListingStatus } from "@/features/jobListings/lib/utils";
import { APP_ROUTES } from "@/config/appConfig";
import { jobListingApplicationIdTag, jobListingIdTag } from "@/lib/dataCache";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { ParamsType } from "@/types/params.type";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import ApplicationTable from "@/features/jobListingApplications/components/ApplicationTable";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";

export default function SingleJobListingPage(props: ParamsType) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

const SuspendedComponent = async ({ params }: ParamsType) => {
  const { jobListingId } = await params;
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return notFound();

  // Get job listing by organization id (cached)
  const cachedData = unstable_cache(
    async () => await getJobListingByOrgIdDb(jobListingId, orgId),
    [jobListingId, orgId],
    {
      tags: [jobListingIdTag(orgId, "jobListings", jobListingId)],
    }
  );

  const jobListing = await cachedData();
  if (jobListing == null) return notFound();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        {/* Left */}
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

        {/* Right */}
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
                Loading...
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
              Delete
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
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description ?? ""}
          />
        }
        dialogTitle="Description"
      />

      <Separator />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Suspense fallback={<SkeletonApplicationTable />}>
          <Applications jobListingId={jobListingId} />
        </Suspense>
      </div>
    </div>
  );
};

// Get job listing by org id
const getJobListingByOrgIdDb = async (id: string, orgId: string) => {
  return await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.organizationId, orgId)
    ),
  });
};

const StatusToggleButton = ({
  status,
  id,
}: {
  status: JobListingStatusType;
  id: string;
}) => {
  const nextStatus = nextJobListingStatus(status);
  const shouldShowAlert =
    nextStatus === "published" || nextStatus === "delisted";
  const alertDescription =
    nextStatus === "published"
      ? "This will immediately show this job listing to all users."
      : "This will immediately hide this job listing from all users.";

  return (
    <CheckCondition
      condition={() => hasOrgUserPermission("job_listing:change_status")}
    >
      {nextStatus === "published" ? (
        <CheckCondition
          condition={async () => {
            const isMax = await hasReachedMaxPublishedJobListings();
            return !isMax;
          }}
          otherwise={
            <UpgradePopOver
              buttonText={statusToggleButtonText(status)}
              popOverText="You must upgrade your plan to publish more job listings"
            />
          }
        >
          <ActionButton
            variant="outline"
            action={toggleJobListingStatus.bind(null, id)}
            areYouSure={shouldShowAlert}
            sureDescription={alertDescription}
          >
            {statusToggleButtonText(status)}
          </ActionButton>
        </CheckCondition>
      ) : (
        <ActionButton
          variant="outline"
          action={toggleJobListingStatus.bind(null, id)}
          areYouSure={shouldShowAlert}
          sureDescription={alertDescription}
        >
          {statusToggleButtonText(status)}
        </ActionButton>
      )}
    </CheckCondition>
  );
};

const UpgradePopOver = ({
  buttonText,
  popOverText,
}: {
  buttonText: ReactNode;
  popOverText: ReactNode;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popOverText}
        <Button asChild>
          <Link href={APP_ROUTES.EMPLOYER.PRICING}>Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

const featuredToggleButtonText = (isFeatured: boolean) => {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        Unfeature
      </>
    );
  }

  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
};

const FeatureToggleButton = ({
  isFeatured,
  id,
}: {
  isFeatured: boolean;
  id: string;
}) => {
  return (
    <CheckCondition
      condition={() => hasOrgUserPermission("job_listing:change_status")}
    >
      {isFeatured ? (
        <ActionButton
          variant="outline"
          action={toggleJobListingFeaturedStatus.bind(null, id)}
        >
          {featuredToggleButtonText(isFeatured)}
        </ActionButton>
      ) : (
        <CheckCondition
          condition={async () => {
            const isMax = await hasReachedMaxFeaturedJobListings();
            return !isMax;
          }}
          otherwise={
            <UpgradePopOver
              buttonText={featuredToggleButtonText(isFeatured)}
              popOverText="You must upgrade your plan to feature more job listings"
            />
          }
        >
          <ActionButton
            variant="outline"
            action={toggleJobListingFeaturedStatus.bind(null, id)}
          >
            {featuredToggleButtonText(isFeatured)}
          </ActionButton>
        </CheckCondition>
      )}
    </CheckCondition>
  );
};

const statusToggleButtonText = (status: JobListingStatusType) => {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Invalid status: ${status satisfies never}`);
  }
};

const SkeletonApplicationTable = () => {
  return null;
};

const Applications = async ({ jobListingId }: { jobListingId: string }) => {
  // Fetch applications by jobListingId from db (cached)
  const cachedData = unstable_cache(
    async () => await getJobListingApplications(jobListingId),
    [jobListingApplicationIdTag("jobListingApplications", jobListingId)],
    {
      tags: [
        jobListingApplicationIdTag("jobListingApplications", jobListingId),
      ],
    }
  );

  const applications = await cachedData();

  return (
    <ApplicationTable
      applications={applications} // todo: fix applications
      canUpdateRating={await hasOrgUserPermission(
        "job_listing_application:change_rating"
      )}
      canUpdateStatus={await hasOrgUserPermission(
        "job_listing_application:change_status"
      )}
    />
  );
};

const getJobListingApplications = async (jobListingId: string) => {
  const result = await db.query.jobListingApplicationsTable.findMany({
    where: eq(jobListingApplicationsTable.jobListingId, jobListingId),
    columns: {
      jobListingId: true,
      coverLetter: true,
      rating: true,
      status: true,
      createdAt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          first_name: true,
          last_name: true,
          image: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              aiSummary: true,
            },
          },
        },
      },
    },
  });

  return result;
};
