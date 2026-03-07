import {
  applicationTable,
  organizationTable,
  resumeTable,
  signInSchema,
  signUpSchema,
} from "@/drizzle/schema";
import { userTable } from "@/drizzle/schemas/user-schema";
import {
  approveRequestSchema,
  employerRequestSchema,
  organizationRequestSchema,
  rejectRequestSchema,
} from "@/features/admin/schema/admin-form-schema";
import { ourFileRouter } from "@/services/uploadthing/core";
import { Column } from "@tanstack/react-table";
import { Key, ReactNode } from "react";
import z from "zod";

// Auth
export type SignInFormType = z.infer<typeof signInSchema>;
export type SignUpFormType = z.infer<typeof signUpSchema>;

// Others
export type OurFileRouterType = typeof ourFileRouter;

export type PaginationType = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type SidebarNavMenuType = {
  href: string;
  icon: ReactNode;
  label: string;
  activePathPrefixes?: string[];
  authStatus?: "signedIn" | "signedOut";
  roles?: UserRoleType[];
}[];

export type CityType = {
  city: string;
  lat: string;
  lng: string;
  country: string;
};

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
  status: "pending" | "approved" | "rejected";
  requestMessage: string;
  adminResponse: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<UserType, "id" | "name" | "email" | "image">;
  reviewer: Pick<UserType, "id" | "name" | "email"> | null;
};

// Admin
export type EmployerRequestFormType = z.infer<typeof employerRequestSchema>;
export type ApproveRequestFormType = z.infer<typeof approveRequestSchema>;
export type RejectRequestFormType = z.infer<typeof rejectRequestSchema>;

// Organization
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
export type OrganizationType = typeof organizationTable.$inferSelect;
export type NewOrganizationType = typeof organizationTable.$inferInsert;

// Client
export type ClientSearchParamsType = {
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

// Application
export type ApplicationType = Pick<
  typeof applicationTable.$inferSelect,
  "jobListingId" | "status" | "createdAt"
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
