import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { APP_ROUTES } from "@/lib/appConfig";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";
import { EditIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ParamsType = {
  params: Promise<{ jobListingId: string }>;
};

const getJobListingByOrgId = async (jobListingId: string) => {
  const result = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.id, jobListingId));

  return result[0];
};

const SuspendedPage = async ({ params }: ParamsType) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListingByOrgId(jobListingId);
  if (jobListing == null) return notFound();

  return (
    <div className="spacey-6 max-w-6xl max-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>

          <div className="flex flex-wrap gap-2 mt-2">
            {/* Custome edit Badge */}
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 empty:-mt-4">
          <Button asChild variant="outline">
            <Link
              href={`${APP_ROUTES.EMPLOYER_JOB_LISTING}/${jobListing.id}/edit`}
            >
              <EditIcon className="size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function SingleJobListingPage(props: ParamsType) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}
