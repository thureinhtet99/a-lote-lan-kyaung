import { CacheType } from "@/types/cache.type";

// JobListing
export const jobListingsTag = (orgId: string, tag: CacheType) => {
  return `${orgId}-${tag}` as const;
};

// JobListing Id
export const jobListingIdTag = (
  orgId: string,
  tag: CacheType,
  jobListingId: string,
) => {
  return `${orgId}-${tag}-${jobListingId}` as const;
};

// JobListing Application
export const jobListingApplicationsTag = (
  tag: CacheType,
  jobListingId: string,
) => {
  return `${tag}-${jobListingId}` as const;
};

// Resume
export const userResumeTag = (tag: CacheType, userId: string) => {
  return `${tag}-${userId}`;
};

// Notification
export const userNotificationTag = (tag: CacheType, userId: string) => {
  return `${tag}-${userId}`;
};

// Id
export const idTag = (tag: CacheType, id: string) => {
  return `${tag}-${id}` as const;
};
