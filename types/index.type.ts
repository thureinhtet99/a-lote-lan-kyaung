import { applicationTable, resumeTable, userTable } from "@/drizzle/schema";
import {
  approveOrgRequestSchema,
  approveRequestSchema,
  employerRequestSchema,
  organizationRequestSchema,
  rejectOrgRequestSchema,
  rejectRequestSchema,
} from "@/features/admin/schema/admin-schema";
import { Column } from "@tanstack/react-table";
import { Key, ReactNode } from "react";
import z from "zod";

// Cities
export type CityType = {
  city: string;
  lat: string;
  lng: string;
  country: string;
};

// Logo
export type LogoType = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
};

// User
export type UserPermissionType =
  | "org:job_listing:create"
  | "org:job_listing:update"
  | "org:job_listing:delete"
  | "org:application:read"
  | "org:application:update"
  | "org:member:invite"
  | "org:member:remove";

export type UserRoleType = "user" | "admin" | "employer";

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  image: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  createdAt: Date;
};

// Employer
export type EmployerRequestType = {
  id: string;
  userId: string;
  status: string;
  requestMessage: string;
  adminResponse: string | null;
  reviewedBy: string;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<UserType, "id" | "name" | "email" | "image">;
  reviewer: Pick<UserType, "id" | "name" | "email">;
};

export type EmployerRequestFormType = z.infer<typeof employerRequestSchema>;
export type ApproveRequestFormType = z.infer<typeof approveRequestSchema>;
export type RejectRequestFormType = z.infer<typeof rejectRequestSchema>;

// Organization request
export type OrganizationRequestType = {
  id: string;
  userId: string;
  orgName: string;
  orgSlug: string;
  orgLogo: string | null;
  requestMessage: string;
  status: "pending" | "approved" | "rejected";
  adminResponse: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdOrganizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<UserType, "id" | "name" | "email" | "image">;
  reviewer: Pick<UserType, "id" | "name" | "email"> | null;
};

export type OrgRequestFormType = z.infer<typeof organizationRequestSchema>;
export type ApproveOrgRequestFormType = z.infer<typeof approveOrgRequestSchema>;
export type RejectOrgRequestFormType = z.infer<typeof rejectOrgRequestSchema>;

// Organization
export type OrganizationType = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
  role: UserRoleType;
};

export type SidebarNavMenuType = {
  href: string;
  icon: ReactNode;
  label: string;
  activePathPrefixes?: string[];
  authStatus?: "signedIn" | "signedOut";
  roles?: UserRoleType[];
}[];

export type JobSeekerSearchParamsType = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: Promise<{ jobListingId: string }>;
};

export type SearchParamsType = {
  searchParams: Promise<{ redirect?: string }>;
};

export type CheckConditionType = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  otherwise?: ReactNode;
};

export type ApplicationType = Pick<
  typeof applicationTable.$inferSelect,
  "jobListingId" | "rating" | "status" | "created_at"
> & {
  coverLetterMarkDown: ReactNode | null;
  user: Pick<typeof userTable.$inferSelect, "id" | "name" | "image"> & {
    resume:
      | (Pick<typeof resumeTable.$inferSelect, "resumeFileUrl"> & {
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
