// Organizations
export const organizationsTag = (userId: string) => {
  return `organizations-${userId}` as const;
};

// Organization
export const organizationTag = (orgId: string, userId: string) => {
  return `organization-${orgId}-user-${userId}` as const;
};

// Organizations id
export const organizationIdTag = (orgId: string) => {
  return `organization-${orgId}` as const;
};

// JobListing
export const jobListingsTag = (orgId: string) => {
  return `organization-${orgId}-job-listings` as const;
};

// JobListing Id
export const jobListingIdTag = (orgId: string, jobListingId: string) => {
  return `organization-${orgId}-job-listing-${jobListingId}` as const;
};

// Most recent jobListing Id
export const mostRecentJobListingIdTag = (
  orgId: string,
  jobListingId: string,
) => {
  return `organization-${orgId}-most-recent-job-listing-${jobListingId}` as const;
};

// Application
export const applicationTag = (jobListingId: string, userId: string) => {
  return `job-listing-${jobListingId}-user-${userId}-application` as const;
};

// Application by job-listing id
export const jobListingApplicationsTag = (jobListingId: string) => {
  return `job-listing-${jobListingId}-applications` as const;
};

// Sidebar
export const sideBarJobListingWithApplicationsTag = (
  orgId: string,
  userId: string,
) => {
  return `organization-${orgId}-user-${userId}-job-listings-application` as const;
};

// Resume
export const resumeTag = (userId: string) => {
  return `user-${userId}-resume` as const;
};

// Notification
export const userNotificationTag = (userId: string) => {
  return `user-${userId}-notification` as const;
};

// Admin Dashboard Stats
export const dashboardStatsTag = () => {
  return `admin-stats` as const;
};
