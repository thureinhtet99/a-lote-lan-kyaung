import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { getPublishedJobListingCountByOrg } from "../db/job-listing-db";

// For now, we'll use simple limits. In the future, this can be integrated with a pricing/plan system
const MAX_PUBLISHED_JOBS = 50;

export const hasReachedMaxPublishedJobListings = async () => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return true;

  const { success, data } = await getPublishedJobListingCountByOrg(orgId);
  if (!success || !data) return true;
  return data >= MAX_PUBLISHED_JOBS;
};
