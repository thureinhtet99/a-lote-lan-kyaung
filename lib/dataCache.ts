import { CacheType } from "@/types/cache.type";

// export function getGlobalTag(tag: CacheType) {
//   return `${tag}` as const;
// }

export const jobListingApplicationIdTag = (
  tag: CacheType,
  jobListingId: string,
  userId: string
) => {
  return `${tag}-${jobListingId}-${userId}` as const;
};

export const jobListingApplicationGlobalTag = (
  orgId: string,
  tag: CacheType
) => {
  return `${orgId}-${tag}-jobListingApplications`;
};

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

export const userResumeTag = (tag: CacheType, userId: string) => {
  return `${tag}-${userId}`;
};

export const idTag = (tag: CacheType, id: string) => {
  return `${tag}-${id}` as const;
};

// export function getJobListingApplicationTag(
//   tag: CacheType,
//   jobListingId: string,
//   userId: string
// ) {
//   return `${tag}-${jobListingId}-${userId}` as const;
// }

// export function getOrganizationJobListingTag(
//   tag: CacheType,
//   jobListingId: string,
//   organizationId: string
// ) {
//   return `${tag}-${organizationId}-${jobListingId}` as const;
// }

// export function getIdTag(tag: CacheType, id: string) {
//   return `${tag}-${id}` as const;
// }
