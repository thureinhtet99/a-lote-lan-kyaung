import { getCurrentOrg } from "@/lib/auth-helpers";
import { db } from "@/drizzle/db";
import { and, count, eq } from "drizzle-orm";
import { jobListingsTable } from "@/drizzle/schema";
import { getPublishedJobListingCountDb } from "../db/job-listing-db";

// For now, we'll use simple limits. In the future, this can be integrated with a pricing/plan system
const MAX_PUBLISHED_JOBS = 50;
const MAX_FEATURED_JOBS = 3;

export const hasReachedMaxPublishedJobListings = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return true;

  const count = await getPublishedJobListingCountDb(orgId);
  return count >= MAX_PUBLISHED_JOBS;
};

export const hasReachedMaxFeaturedJobListings = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return true;

  const count = await getFeaturedJobListingCountDb(orgId);
  return count >= MAX_FEATURED_JOBS;
};

// Get featured job listings count
const getFeaturedJobListingCountDb = async (orgId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(jobListingsTable)
    .where(
      and(
        eq(jobListingsTable.organizationId, orgId),
        eq(jobListingsTable.isFeatured, true),
      ),
    );
  return result?.count ?? 0;
};
