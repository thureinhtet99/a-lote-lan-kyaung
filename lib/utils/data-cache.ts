type CacheType =
  | "users"
  | "organizations"
  | "job-listings"
  | "applications"
  | "organization-user-settings"
  | "user-notification-settings"
  | "user-resumes"
  | "admin-stats"
  | "employer-requests";

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
  userId: string,
) => {
  return `${tag}-${jobListingId}-${userId}` as const;
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

// Admin Dashboard Stats
export const tag = (tag: CacheType) => {
  return `${tag}` as const;
};
