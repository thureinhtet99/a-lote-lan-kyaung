import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  experienceLevels,
  jobListingTable,
  jobListingTypes,
  locationRequirements,
  organizationTable,
} from "@/drizzle/schema";
import { Suspense } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInDays } from "date-fns";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import z from "zod";
import { unstable_cache } from "next/cache";
import { jobListingsTag } from "@/lib/utils/data-cache";
import { convertSearchParamsToString } from "@/lib/utils/convert-search-params-to-string";
import Loading from "@/components/shared/loading";
import JobListingBadges from "@/features/job-listings/components/job-listing-badges";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { JobSeekerSearchParamsType } from "@/types/index.type";

// Search params schema
const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience_level: z.enum(experienceLevels).optional().catch(undefined),
  location: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((job) => (Array.isArray(job) ? job : [job]))
    .optional()
    .catch([]),
});

// Get all job listings
const getAllJobListings = async (
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId: string | undefined,
) => {
  const whereConditions: (SQL | undefined)[] = [];

  if (searchParams.title)
    whereConditions.push(
      ilike(jobListingTable.title, `%${searchParams.title}%`),
    );

  if (searchParams.location)
    whereConditions.push(
      eq(jobListingTable.locationRequirement, searchParams.location),
    );

  if (searchParams.city)
    whereConditions.push(ilike(jobListingTable.city, searchParams.city));

  if (searchParams.state)
    whereConditions.push(eq(jobListingTable.state, searchParams.state));

  if (searchParams.experience_level)
    whereConditions.push(
      eq(jobListingTable.experienceLevel, searchParams.experience_level),
    );

  if (searchParams.type)
    whereConditions.push(eq(jobListingTable.type, searchParams.type));

  if (searchParams.jobIds)
    whereConditions.push(
      or(...searchParams.jobIds.map((jobId) => eq(jobListingTable.id, jobId))),
    );

  return await db.query.jobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(jobListingTable.status, "published"),
            eq(jobListingTable.id, jobListingId),
          )
        : undefined,
      and(eq(jobListingTable.status, "published"), ...whereConditions),
    ),
    with: {
      organization: {
        columns: {
          name: true,
          logo: true,
        },
      },
    },
    orderBy: [
      desc(jobListingTable.isFeatured),
      desc(jobListingTable.posted_at),
    ],
  });
};

// Calculate postedAt from today's date
const DaySincePosting = async ({ postedAt }: { postedAt: Date }) => {
  await connection();

  const daySincePosted = differenceInDays(postedAt, Date.now());
  if (daySincePosted === 0) {
    return <Badge>New</Badge>;
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daySincePosted, "days");
};

export default function JobListingItem(props: JobSeekerSearchParamsType) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

const SuspendedComponent = async ({
  searchParams,
  params,
}: JobSeekerSearchParamsType) => {
  const { orgId } = await getCurrentOrg();
  const jobListingId = params ? (await params).jobListingId : undefined;
  const { success, data } = searchParamsSchema.safeParse(await searchParams);
  const search = success ? data : {};

  // Get all job listings (cached)
  const cachedData = unstable_cache(
    async (
      searchParams: z.infer<typeof searchParamsSchema>,
      jobListingId: string | undefined,
    ) => getAllJobListings(searchParams, jobListingId),
    [jobListingsTag(orgId || "", "job-listings")],
    {
      tags: [jobListingsTag(orgId || "", "job-listings")],
    },
  );

  const jobListings = await cachedData(search, jobListingId);
  if (jobListings.length === 0)
    return (
      <div className="text-muted-foreground p-4 text-center">
        No job listings found
      </div>
    );

  return (
    <div className="space-y-4">
      {jobListings.map((job) => (
        <Link
          className="block"
          key={job.id}
          href={`${APP_ROUTES.JOB_LISTINGS.HOME}/${
            job.id
          }?${convertSearchParamsToString(search)}`}
        >
          <JobListingListItem
            jobListing={job}
            organization={job.organization}
          />
        </Link>
      ))}
    </div>
  );
};

const JobListingListItem = ({
  jobListing,
  organization: org,
}: {
  jobListing: Pick<
    typeof jobListingTable.$inferSelect,
    | "title"
    | "state"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "posted_at"
    | "locationRequirement"
    | "isFeatured"
  >;
  organization: Pick<
    typeof organizationTable.$inferSelect,
    "name" | "logo"
  > | null;
}) => {
  const orgNameInitial =
    org?.name
      ?.split(" ")
      .splice(0, 4)
      .map((word: string) => word[0])
      .join("") || "";

  return (
    <Card
      className={cn(
        "@container transition-all hover:shadow-lg hover:border-primary/30",
        jobListing.isFeatured &&
          "border-secondary bg-gradient-to-r from-secondary/10 to-tertiary/5 shadow-md",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex gap-4 items-start">
          <Avatar className="size-16 @max-sm:hidden border-2 border-primary/10">
            <AvatarImage
              className="object-cover"
              src={org?.logo ?? undefined}
              alt={org?.name ?? ""}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground text-lg font-semibold">
              {orgNameInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                {jobListing.title}
              </CardTitle>
              {jobListing.isFeatured && (
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90 whitespace-nowrap">
                  ⭐ Featured
                </Badge>
              )}
            </div>
            <CardDescription className="text-base font-medium">
              {org?.name ?? "Unknown Organization"}
            </CardDescription>
            {jobListing.posted_at != null && (
              <div className="text-sm font-medium text-muted-foreground @min-md:hidden">
                <Suspense
                  fallback={
                    jobListing.posted_at
                      ? new Date(jobListing.posted_at).toLocaleDateString()
                      : ""
                  }
                >
                  <DaySincePosting postedAt={jobListing.posted_at} />
                </Suspense>
              </div>
            )}
          </div>

          {jobListing.posted_at != null && (
            <div className="text-sm font-semibold text-muted-foreground @max-md:hidden bg-secondary/10 px-3 py-1 rounded-md">
              <Suspense
                fallback={
                  jobListing.posted_at
                    ? new Date(jobListing.posted_at).toLocaleDateString()
                    : ""
                }
              >
                <DaySincePosting postedAt={jobListing.posted_at} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        <JobListingBadges
          jobListing={jobListing}
          className={
            jobListing.isFeatured
              ? "border-secondary/40 bg-secondary/5"
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
};
