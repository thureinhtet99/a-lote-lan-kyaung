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
  return `${jobListingId}-${tag}` as const;
}

export function getOrganizationTag(tag: CacheType, organizationId: string) {
  return `${organizationId}-${tag}` as const;
}

export function getIdTag(tag: CacheType, id: string) {
  return `${id}-${tag}` as const;
}
