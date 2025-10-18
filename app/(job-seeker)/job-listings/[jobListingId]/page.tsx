import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { APP_CONFIG } from "@/config/appConfig";
import BreakPoint from "@/components/BreakPoint";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ClientSheet from "./_ClientSheet";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { jobListingsTable } from "@/drizzle/schema";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { XIcon } from "lucide-react";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { SignUpButton } from "@/services/clerk/component/AuthButtons";
import { unstable_cache } from "next/cache";
import { idTag } from "@/lib/dataCache";

// Get job listing by id
const getJobListingById = async (id: string) => {
  return await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.status, "published")
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
          <SignUpButton />
        </PopoverContent>
      </Popover>
    );
  }

  // TODO: Implement apply functionality for authenticated users
  return <Button>Apply</Button>;
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
    [jobListingId],
    {
      tags: [idTag("jobListings", jobListingId)],
    }
  );
  const jobListing = await cachedData(jobListingId);
  // const jobListing = await getJobListingById(jobListingId);
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
              src={jobListing.organization.image ?? undefined}
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
                  <Suspense fallback={<LoadingSpinner />}>
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
              <Suspense fallback={<LoadingSpinner />}>
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
