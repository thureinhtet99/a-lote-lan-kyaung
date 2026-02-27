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

// JobListing Application
export const jobListingApplicationsTag = (
  jobListingId: string,
  userId: string,
) => {
  return `job-listing-${jobListingId}-user-${userId}-applications` as const;
};

// Sidebar
export const sideBarJobListingWithApplicationsTag = (
  orgId: string,
  userId: string,
) => {
  return `organization-${orgId}-user-${userId}-job-listings-applications` as const;
};

// Resume
export const userResumeTag = (userId: string) => {
  return `user-${userId}-resumes` as const;
};

// Notification
export const userNotificationTag = (userId: string) => {
  return `user-${userId}-notifications` as const;
};

// Admin Dashboard Stats
export const dashboardStatsTag = () => {
  return `admin-stats` as const;
};
