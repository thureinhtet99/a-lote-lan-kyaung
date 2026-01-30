import {
  jobListingApplicationsTable,
  userResumesTable,
  usersTable,
} from "@/drizzle/schema";
import { Column } from "@tanstack/react-table";
import { Key, ReactNode } from "react";

export type CacheType =
  | "users"
  | "organizations"
  | "jobListings"
  | "jobListingApplications"
  | "organizationUserSettings"
  | "userNotificationSettings"
  | "userResumes";

export type UserPermissionType =
  | "job_listing_application:change_status"
  | "job_listing_application:change_rating"
  | "job_listing:change_status"
  | "job_listing:create"
  | "job_listing:update"
  | "job_listing:delete";

export type PlanFeatureType =
  | "post_1_job_listing"
  | "post_3_job_listings"
  | "post_50_job_listings"
  | "1_featured_job_listing"
  | "3_featured_job_listing"
  | "unlimited_featured_job_listings";

export type SidebarNavMenuGroupType = {
  href: string;
  icon: ReactNode;
  label: string;
  authStatus?: "signedIn" | "signedOut";
}[];

export type ParamsType = {
  params: Promise<{ jobListingId: string }>;
};

export type JobSeekerSearchParamsType = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: ParamsType;
};

export type SearchParamsType = {
  searchParams: Promise<{ redirect?: string }>;
};

export type CheckConditionType = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  otherwise?: ReactNode;
};

export type JobListingApplicationType = Pick<
  typeof jobListingApplicationsTable.$inferSelect,
  "jobListingId" | "rating" | "status" | "createdAt"
> & {
  coverLetterMarkDown: ReactNode | null;
  user: Pick<
    typeof usersTable.$inferSelect,
    "id" | "first_name" | "last_name" | "image"
  > & {
    resume:
      | (Pick<typeof userResumesTable.$inferSelect, "resumeFileUrl"> & {
          markdownSummary: ReactNode | null;
        })
      | null;
  };
};

export type DataTableFacetedTablePropsType<TData, TValue, OValue> = {
  column?: Column<TData, TValue>;
  title: string;
  disabled?: boolean;
  options: {
    label: ReactNode;
    value: OValue;
    key: Key;
  }[];
};
