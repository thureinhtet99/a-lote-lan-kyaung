import { ReactNode } from "react";

export type ParamsType = {
  params: Promise<{ jobListingId: string }>;
};

export type SearchParamsType = {
  searchParams: Promise<{ redirect?: string }>;
};

export type PlanFeatureType =
  | "post_1_job_listing"
  | "post_3_job_listings"
  | "post_50_job_listings"
  | "unlimited_featured_job_listings"
  | "1_featured_job_listing";

export type UserPermissionType =
  | "job_listing_application:change_status"
  | "job_listing_application:change_rating"
  | "job_listing:change_status"
  | "job_listing:create"
  | "job_listing:update"
  | "job_listing:delete";

export type CacheType =
  | "users"
  | "organizations"
  | "jobListings"
  | "userNotificationSettings"
  | "userResumes"
  | "jobListingApplications"
  | "organizationUserSettings";

export type CheckConditionType = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};
