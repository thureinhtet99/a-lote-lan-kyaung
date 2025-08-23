import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Create a cached factory function that depends on orgId
const getMostRecentJobListing = (orgId: string) => {
  return unstable_cache(
    async () => {
      return await db.query.jobListingsTable.findFirst({
        where: eq(jobListingsTable.organizationId, orgId),
        orderBy: desc(jobListingsTable.createdAt),
        columns: { id: true },
      });
    },
    [`${orgId}-organizations`], // cache key includes orgId
    {
      tags: [`${orgId}-organizations`], // tag also includes orgId
      revalidate: 3600, // 1 hour
    }
  )(); // <-- call immediately
};

const SuspendedPage = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return null;

  const recentJobListing = await getMostRecentJobListing(orgId);

  if (recentJobListing == null) {
    redirect("/employer/job-listings/new");
  } else {
    redirect(`/employer/job-listings/${recentJobListing.id}`);
  }

};

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}
