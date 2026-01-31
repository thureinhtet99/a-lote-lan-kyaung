import { getCurrentOrg } from "@/services/clerk/lib/get-current-auth";
import { hasPlanFeature } from "@/services/clerk/lib/plan-feature";
import { db } from "@/drizzle/db";
import { and, count, eq } from "drizzle-orm";
import { jobListingsTable } from "@/drizzle/schema";
import { getPublishedJobListingCountDb } from "../db/job-listing-db";

export const hasReachedMaxPublishedJobListings = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return true;

  const count = await getPublishedJobListingCountDb(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_1_job_listing").then((has) => has && count < 1),
    hasPlanFeature("post_3_job_listings").then((has) => has && count < 3),
    hasPlanFeature("post_50_job_listings").then((has) => has && count < 50),
  ]);

  return !canPost.some(Boolean);
};

export const hasReachedMaxFeaturedJobListings = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return true;

  const count = await getFeaturedJobListingCountDb(orgId);

  const canFeature = await Promise.all([
    hasPlanFeature("1_featured_job_listing").then((has) => has && count < 1),
    hasPlanFeature("3_featured_job_listing").then((has) => has && count < 3),
    hasPlanFeature("unlimited_featured_job_listings"),
  ]);

  return !canFeature.some(Boolean);
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
