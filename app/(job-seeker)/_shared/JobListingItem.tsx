import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  experienceLevels,
  jobListingsTable,
  jobListingTypes,
  locationRequirements,
  organizationsTable,
} from "@/drizzle/schema";
import { Suspense } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/appConfig";
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
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import z from "zod";
import { unstable_cache } from "next/cache";
import { jobListingGlobalTag } from "@/lib/dataCache";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { JobSeekerSearchParamsType } from "@/types/params.type";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";

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
  jobListingId: string | undefined
) => {
  const whereConditions: (SQL | undefined)[] = [];

  if (searchParams.title)
    whereConditions.push(
      ilike(jobListingsTable.title, `%${searchParams.title}%`)
    );

  if (searchParams.location)
    whereConditions.push(
      eq(jobListingsTable.locationRequirement, searchParams.location)
    );

  if (searchParams.city)
    whereConditions.push(ilike(jobListingsTable.city, searchParams.city));

  if (searchParams.state)
    whereConditions.push(eq(jobListingsTable.state, searchParams.state));

  if (searchParams.experience_level)
    whereConditions.push(
      eq(jobListingsTable.experienceLevel, searchParams.experience_level)
    );

  if (searchParams.type)
    whereConditions.push(eq(jobListingsTable.type, searchParams.type));

  if (searchParams.jobIds)
    whereConditions.push(
      or(...searchParams.jobIds.map((jobId) => eq(jobListingsTable.id, jobId)))
    );

  return await db.query.jobListingsTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(jobListingsTable.status, "published"),
            eq(jobListingsTable.id, jobListingId)
          )
        : undefined,
      and(eq(jobListingsTable.status, "published"), ...whereConditions)
    ),
    with: {
      organization: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: [
      desc(jobListingsTable.isFeatured),
      desc(jobListingsTable.postedAt),
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

const JobListingListItem = ({
  jobListing,
  organization,
}: {
  jobListing: Pick<
    typeof jobListingsTable.$inferSelect,
    | "title"
    | "state"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "postedAt"
    | "locationRequirement"
    | "isFeatured"
  >;
  organization: Pick<
    typeof organizationsTable.$inferSelect,
    "name" | "image"
  > | null;
}) => {
  const orgNameInitial =
    organization?.name
      ?.split(" ")
      .splice(0, 4)
      .map((word) => word[0])
      .join("") || "";

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-featured bg-featured/20"
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              className="object-cover"
              src={organization?.image ?? undefined}
              alt={organization?.name ?? ""}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {orgNameInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription className="text-base">
              {organization?.name ?? "Unknown Organization"}
            </CardDescription>
            {jobListing.postedAt != null && (
              <div className="text-sm font-medium text-pretty @min-md:hidden">
                <Suspense
                  fallback={
                    jobListing.postedAt
                      ? new Date(jobListing.postedAt).toLocaleDateString()
                      : ""
                  }
                >
                  <DaySincePosting postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>

          {jobListing.postedAt != null && (
            <div className="text-sm font-medium text-pretty ml-auto @max-md:hidden">
              <Suspense
                fallback={
                  jobListing.postedAt
                    ? new Date(jobListing.postedAt).toLocaleDateString()
                    : ""
                }
              >
                <DaySincePosting postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
      </CardContent>
    </Card>
  );
};

const SuspendedComponent = async ({
  searchParams,
  params,
}: JobSeekerSearchParamsType) => {
  const { orgId } = await getCurrentOrg(); // Get from auth/session
  const jobListingId = params ? (await params).jobListingId : undefined;
  const { success, data } = searchParamsSchema.safeParse(await searchParams);
  const search = success ? data : {};

  // Get all job listings (cached)
  const cachedData = unstable_cache(
    async (
      searchParams: z.infer<typeof searchParamsSchema>,
      jobListingId: string | undefined
    ) => getAllJobListings(searchParams, jobListingId),
    ["jobListings"],
    {
      tags: [jobListingGlobalTag(orgId || "", "jobListings")],
    }
  );

  const jobListings = await cachedData(search, jobListingId);
  if (jobListings.length === 0)
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
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

export default function JobListingItem(props: JobSeekerSearchParamsType) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}
