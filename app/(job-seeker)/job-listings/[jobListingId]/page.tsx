import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { APP_CONFIG, APP_ROUTES } from "@/constants/app-config";
import { Suspense } from "react";
import ResponsiveBreakpoint from "@/components/shared/responsive-breakpoint";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import {
  applicationTable,
  jobListingTable,
  resumeTable,
} from "@/drizzle/schema";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { convertSearchParamsToString } from "@/lib/utils/convert-search-params-to-string";
import { XIcon } from "lucide-react";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { NewJobListingApplicationForm } from "@/features/applications/components/new-job-listing-application-form";
import JobListingBadges from "@/components/job-listings/job-listing-badges";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import Loading from "@/components/shared/loading";
import { cacheTag, cacheLife } from "next/cache";
import ClientSheet from "./_ClientSheet";

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
        <ResponsiveBreakpoint
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
        </ResponsiveBreakpoint>
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
  return await db.query.applicationTable.findFirst({
    where: and(
      eq(applicationTable.jobListingId, jobListingId),
      eq(applicationTable.userId, userId),
    ),
  });
};

async function getCachedJobListing(id: string) {
  "use cache";
  cacheTag("job-listing-" + id);
  cacheLife("hours");
  return await getJobListingById(id);
}

const JobListingDetails = async ({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) => {
  const { jobListingId } = await params;

  // Get job listing by id (cached)
  const jobListing = await getCachedJobListing(jobListingId);
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
            {jobListing.posted_at != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {new Date(jobListing.posted_at).toLocaleDateString()}
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
  return await db.query.jobListingTable.findFirst({
    where: and(
      eq(jobListingTable.id, id),
      eq(jobListingTable.status, "published"),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          logo: true,
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
  const application = await getCachedJobListingApplication(
    jobListingId,
    userId,
  );
  if (application != null) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: "short",
      numeric: "always",
    });
    // undefined = user’s current system/browser locale.

    await connection();
    const difference = differenceInDays(application.created_at, new Date());

    return (
      <div className="text-muted-foreground text-sm">
        You applied for this job{" "}
        {difference === 0 ? "today" : formatter.format(difference, "days")}
      </div>
    );
  }

  // Get user resume by userId (cached)
  const resume = await getCachedUserResume(userId);
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
  return await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
  });
};

async function getCachedUserResume(userId: string) {
  "use cache";
  cacheTag("user-resume-" + userId);
  cacheLife("hours");
  return await getUserResume(userId);
}

async function getCachedJobListingApplication(
  jobListingId: string,
  userId: string,
) {
  "use cache";
  cacheTag("application-" + jobListingId + "-" + userId);
  cacheLife("minutes");
  return await getJobListingApplication({ jobListingId, userId });
}
