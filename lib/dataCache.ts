import { CacheType } from "@/types";


export function getGlobalTag(tag: CacheType) {
  return `${tag}` as const;
}

export function getJobListingApplicationTag(
  tag: CacheType,
  jobListingId: string,
  userId: string
) {
  return `${tag}-${jobListingId}-${userId}` as const;
}

export function getJobListingOrganizationTag(
  tag: CacheType,
  jobListingId: string,
  organizationId: string
) {
  return `${tag}-${jobListingId}-${organizationId}` as const;
}

export function getIdTag(tag: CacheType, id: string) {
  return `${tag}-${id}` as const;
}
