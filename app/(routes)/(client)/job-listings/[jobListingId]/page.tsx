import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import JobListingBadges from "@/features/job-listings/components/job-listing-badges";
import PageLoading from "@/components/shared/page-loading";
import JobApplyButton from "@/features/job-listings/components/job-apply-button";
import { getPublishedJobListingByIdWithOrganization } from "@/features/job-listings/db/job-listing-db";

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
    <div className="space-y-6 p-6 @container min-h-full">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.data.organization.logo ?? undefined}
              alt={jobListing.data.organization.name}
            />
            <AvatarFallback className="uppercase text-foreground text-sm font-medium">
              {nameInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.data.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.data.organization.name}
            </div>
            {jobListing.data.posted_at != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {new Date(jobListing.data.posted_at).toLocaleDateString()}
              </div>
            )}
          </div>
          <Suspense fallback={<Button disabled>Apply job here</Button>}>
            <JobApplyButton jobListingId={jobListing.data.id} />
          </Suspense>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing.data} />
        </div>

        {jobListing.data.description && (
          <MarkdownRenderer source={jobListing.data.description} />
        )}
      </div>
    </div>
  );
};
