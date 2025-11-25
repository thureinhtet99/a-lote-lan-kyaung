import { CacheType } from "@/types/cache.type";

// Application
export const jobListingApplicationIdTag = (
  tag: CacheType,
  jobListingId: string
) => {
  return `${tag}-${jobListingId}` as const;
};

// JobListing
export const jobListingGlobalTag = (orgId: string, tag: CacheType) => {
  return `${orgId}-${tag}` as const;
};

export const jobListingIdTag = (
  orgId: string,
  tag: CacheType,
  jobListingId: string
) => {
  return `${orgId}-${tag}-${jobListingId}` as const;
};

// Resume
export const userResumeTag = (tag: CacheType, userId: string) => {
  return `${tag}-${userId}`;
};

// Notification
export const userNotiTag = (tag: CacheType, userId: string) => {
  return `${tag}-${userId}`;
};

// Id
export const idTag = (tag: CacheType, id: string) => {
  return `${tag}-${id}` as const;
};
