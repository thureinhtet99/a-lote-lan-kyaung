import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { APP_CONFIG, APP_ROUTES } from "@/config/appConfig";
import BreakPoint from "@/components/BreakPoint";
import { Suspense } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ClientSheet from "./_ClientSheet";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import {
  jobListingApplicationsTable,
  jobListingsTable,
  userResumesTable,
} from "@/drizzle/schema";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { XIcon } from "lucide-react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { unstable_cache } from "next/cache";
import {
  idTag,
  jobListingApplicationsTag,
  userResumeTag,
} from "@/lib/dataCache";
import { differenceInDays } from "date-fns";
import { connection } from "next/server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewJobListingApplicationForm } from "@/features/jobListingApplications/components/NewJobListingApplicationForm";
import JobListingBadges from "@/features/jobListings/components/job-listing-badges";
import { getCurrentUser } from "@/lib/auth-helpers";
import Loading from "@/components/loading";

export default function JobListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <>
      <ResizablePanelGroup
        autoSaveId={`${APP_CONFIG.ID}-job-board`}
        direction="horizontal"
      >
        {/* Left */}
        <ResizablePanel id="left" order={1} defaultSize={60} minSize={30}>
          <div className="p-4 h-screen overflow-y-auto">
            <JobListingDetails searchParams={searchParams} params={params} />
          </div>
        </ResizablePanel>
        <BreakPoint
          breakpoint="min-width: 1024px"
          otherwise={
            <ClientSheet>
              <SheetContent className="p-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Job Listing Details</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  <Suspense fallback={<Loading />}>
                    <JobListingDetails
                      searchParams={searchParams}
                      params={params}
                    />
                  </Suspense>
                </div>
              </SheetContent>
            </ClientSheet>
          }
        >
          <ResizableHandle withHandle className="mx-2" />

          {/* Right  */}
          <ResizablePanel id="right" order={2} defaultSize={40} minSize={30}>
            <div className="p-4 h-screen overflow-y-auto">
              <Suspense fallback={<Loading />}>
                <JobListingDetails
                  searchParams={searchParams}
                  params={params}
                />
              </Suspense>
            </div>
          </ResizablePanel>
        </BreakPoint>
      </ResizablePanelGroup>
    </>
  );
}

// Get job listing application by jobListingId & userId
const getJobListingApplication = async ({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) => {
  return await db.query.jobListingApplicationsTable.findFirst({
    where: and(
      eq(jobListingApplicationsTable.jobListingId, jobListingId),
      eq(jobListingApplicationsTable.userId, userId),
    ),
  });
};

const JobListingDetails = async ({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) => {
  const { jobListingId } = await params;

  // Get job listing by id (cached)
  const cachedData = unstable_cache(
    async (id: string) => getJobListingById(id),
    [idTag("jobListings", jobListingId)],
    {
      tags: [idTag("jobListings", jobListingId)],
    },
  );
  const jobListing = await cachedData(jobListingId);
  if (jobListing == null) return notFound();

  const nameInitials = jobListing.organization.name
    .split(" ")
    .splice(0, 4)
    .map((text) => text[0])
    .join("");

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.organization.logo ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {new Date(jobListing.postedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Only show close button on desktop */}
          <div className="@max-lg:hidden">
            <Button size="icon" variant="outline" asChild>
              <Link
                href={`/?${convertSearchParamsToString(await searchParams)}`}
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        <Suspense fallback={<Button disabled>Apply</Button>}>
          <ApplyButton jobListingId={jobListing.id} />
        </Suspense>
        {jobListing.description && (
          <MarkdownRenderer source={jobListing.description} />
        )}
      </div>
    </div>
  );
};

// Get job listing by id
const getJobListingById = async (id: string) => {
  return await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.status, "published"),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
};

const ApplyButton = async ({ jobListingId }: { jobListingId: string }) => {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to create an account before applying for a job
          {/* <SignUpButton /> */}
        </PopoverContent>
      </Popover>
    );
  }

  // Get job listing application by jobListingId & userId (cached)
  const cachedJobApplication = unstable_cache(
    async (jobListingId: string, userId: string) =>
      getJobListingApplication({ jobListingId, userId }),
    [jobListingApplicationsTag("jobListingApplications", jobListingId)],
    {
      tags: [jobListingApplicationsTag("jobListingApplications", jobListingId)],
    },
  );

  const application = await cachedJobApplication(jobListingId, userId);
  if (application != null) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: "short",
      numeric: "always",
    });
    // undefined = user’s current system/browser locale.

    await connection();
    const difference = differenceInDays(application.createdAt, new Date());

    return (
      <div className="text-muted-foreground text-sm">
        You applied for this job{" "}
        {difference === 0 ? "today" : formatter.format(difference, "days")}
      </div>
    );
  }

  // Get user resume by userId (cached)
  const cachedUserResume = unstable_cache(
    async (userId: string) => getUserResume(userId),
    [userResumeTag("userResumes", userId)],
    { tags: [userResumeTag("userResumes", userId)] },
  );

  const resume = await cachedUserResume(userId);
  if (resume == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to upload your resume before applying for a job
          <Button asChild>
            <Link href={APP_ROUTES.SETTINGS.RESUME}>Upload Resume</Link>
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Application</DialogTitle>
          <DialogDescription>
            Applying for a job cannot be undone and is something you can do once
            per job listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <NewJobListingApplicationForm jobListingId={jobListingId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Get user resume by userId
const getUserResume = async (userId: string) => {
  return await db.query.userResumesTable.findFirst({
    where: eq(userResumesTable.userId, userId),
  });
};
