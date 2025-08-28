type CacheType =
  | "users"
  | "organizations"
  | "jobListings"
  | "userNotificationSettings"
  | "userResumes"
  | "jobListingApplications"
  | "organizationUserSettings";

export function getGlobalTag(tag: CacheType) {
  return `${tag}` as const;
}

export function getJobListingTag(tag: CacheType, jobListingId: string) {
  return `${tag}-${jobListingId}` as const;
}

export function getOrganizationTag(tag: CacheType, organizationId: string) {
  return `${tag}-${organizationId}` as const;
}

export function getJobListingOrganizationTag(tag: CacheType, organizationId: string) {
  return `${tag}-${organizationId}` as const;
}

export function getIdTag(tag: CacheType, id: string) {
  return `${tag}-${id}` as const;
}
