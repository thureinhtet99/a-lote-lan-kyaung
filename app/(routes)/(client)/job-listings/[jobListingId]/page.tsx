import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import JobListingBadges from "@/features/job-listings/components/job-listing-badges";
import PageLoading from "@/components/shared/page-loading";
import JobApplyButton from "@/features/job-listings/components/job-apply-button";
import { getPublishedJobListingByIdWithOrganization } from "@/features/job-listings/db/job-listing-db";
import DaySincePosting from "@/components/shared/day-since-posting";
import { Dot } from "lucide-react";

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

  const jobListing =
    await getPublishedJobListingByIdWithOrganization(jobListingId);
  if (!jobListing.success || !jobListing.data) return notFound();

  const nameInitials = jobListing.data?.organization.name
    .split(" ")
    .splice(0, 4)
    .map((text) => text[0])
    .join("");

  return (
    <div className="space-y-10 p-6 @container min-h-full">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.data.organization.logo ?? undefined}
              alt={jobListing.data.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xl">
              {nameInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-4 flex-1">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {jobListing.data.title}
              </h1>
              <div className="text-base text-muted-foreground">
                {jobListing.data.organization.name}
              </div>
            </div>
          </div>
          <Suspense fallback={<Button disabled>Apply job here</Button>}>
            <JobApplyButton jobListingId={jobListing.data.id} />
          </Suspense>
        </div>

        <div className="flex flex-wrap items-center mt-2">
          {jobListing.data.posted_at != null && (
            <span className="text-sm text-muted-foreground">
              <Suspense
                fallback={
                  jobListing.data.posted_at
                    ? new Date(jobListing.data.posted_at).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        },
                      )
                    : ""
                }
              >
                <DaySincePosting postedAt={jobListing.data.posted_at} />
              </Suspense>
            </span>
          )}
          <Dot className="size-8 text-muted-foreground/80" />
          <JobListingBadges jobListing={jobListing.data} />
        </div>
      </div>

      {jobListing.data.description && (
        <>
          <h2 className="text-xl font-bold tracking-tight">Description</h2>
          <MarkdownRenderer source={jobListing.data.description} />
        </>
      )}
    </div>
  );
};
