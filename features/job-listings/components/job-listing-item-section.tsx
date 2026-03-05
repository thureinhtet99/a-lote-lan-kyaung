import { jobListingTable, organizationTable } from "@/drizzle/schema";
import { Suspense } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { convertSearchParamsToString } from "@/lib/convert-search-params-to-string";
import Loading from "@/components/shared/loading";
import JobListingBadges from "@/features/job-listings/components/job-listing-badges";
import { ClientSearchParamsType } from "@/types/index.type";
import { searchParamsSchema } from "../schema/search-params-schema";
import { getAllJobListings } from "../db/job-listing-db";
import { getPostingJobLabel } from "../lib/utils";

export default function JobListingItemSection(props: ClientSearchParamsType) {
  return (
    <section className="p-6 flex-1">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">
          Latest Job Openings
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Newest opportunities first
        </p>
      </div>
      <Suspense fallback={<Loading />}>
        <SuspendedComponent {...props} />
      </Suspense>
    </section>
  );
}

const SuspendedComponent = async ({
  searchParams,
  params,
}: ClientSearchParamsType) => {
  const jobListingId = params ? (await params).jobListingId : undefined;
  const { success, data } = searchParamsSchema.safeParse(await searchParams);
  const search = success ? data : {};

  const jobListings = await getAllJobListings(search, jobListingId);
  if (!jobListings.success || !jobListings.data)
    return (
      <div className="text-destructive animate-pulse p-4 text-center">
        No job listings found
      </div>
    );

  if (jobListings.data.length === 0)
    return (
      <div className="text-muted-foreground p-4 text-center">
        No result for this job positions
      </div>
    );

  return (
    <div className="space-y-4">
      {jobListings.data.map((job) => (
        <Link
          className="block"
          key={job.id}
          href={`${APP_ROUTES.JOB_LISTINGS.HOME}/${
            job.id
          }?${convertSearchParamsToString(search)}`}
        >
          <JobListingItem jobListing={job} organization={job.organization} />
        </Link>
      ))}
    </div>
  );
};

const JobListingItem = ({
  jobListing,
  organization: org,
}: {
  jobListing: Pick<
    typeof jobListingTable.$inferSelect,
    | "title"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "posted_at"
    | "locationRequirement"
  >;
  organization: Pick<typeof organizationTable.$inferSelect, "name" | "logo">;
}) => {
  const orgNameInitial =
    org?.name
      ?.split(" ")
      .splice(0, 4)
      .map((word: string) => word[0])
      .join("") || "";

  return (
    <Card className="@container overflow-hidden border-border/60 bg-gradient-to-b from-background to-primary/5 transition-all duration-200 hover:border-primary/60">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="size-14 rounded-2xl">
            <AvatarImage src={org?.logo ?? undefined} alt={org.name} />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xl">
              {orgNameInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                  {jobListing.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {org.name}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {jobListing.posted_at != null && (
                  <Badge
                    variant="secondary"
                    className="font-normal text-[11px] px-2.5"
                  >
                    <Suspense
                      fallback={
                        jobListing.posted_at
                          ? new Date(jobListing.posted_at).toLocaleDateString()
                          : ""
                      }
                    >
                      <DaySincePosting postedAt={jobListing.posted_at} />
                    </Suspense>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="flex items-center gap-2">
          <JobListingBadges jobListing={jobListing} className="text-xs" />
        </div>
      </CardContent>
    </Card>
  );
};

const DaySincePosting = ({ postedAt }: { postedAt: Date }) => {
  const label = getPostingJobLabel(postedAt);
  if (label === "New") return <Badge>New</Badge>;

  return label;
};
