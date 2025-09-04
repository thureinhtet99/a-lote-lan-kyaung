import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import {
  getFeaturedJobListingCountDb,
  getPublishedJobListingCountDb,
} from "../db/jobListings";
import { hasPlanFeature } from "@/services/clerk/lib/planFeature";

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
    hasPlanFeature("unlimited_featured_job_listings"),
  ]);

  return !canFeature.some(Boolean);
};
