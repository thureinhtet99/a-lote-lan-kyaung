import { applicationTable, resumeTable, userTable } from "@/drizzle/schema";
import {
  approveRequestSchema,
  employerRequestSchema,
  rejectRequestSchema,
} from "@/features/admin/admin-schema";
import { Column } from "@tanstack/react-table";
import { Key, ReactNode } from "react";
import z from "zod";

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
