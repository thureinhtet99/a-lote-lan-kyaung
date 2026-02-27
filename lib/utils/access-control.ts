import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  organization: ["create", "update", "delete", "switch", "read"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

// User - basic user with limited permissions
export const user = ac.newRole({
  job_listing: ["create", "update"],
  application: ["read", "update"],
});

// Employer - mid-level organization role
export const employer = ac.newRole({
  organization: ["create", "read", "update", "delete"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

// Admin - top-level organization role with full permissions
export const admin = ac.newRole({
  organization: ["create", "read", "update", "delete"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

// Export permission types for use throughout the app
export type StatementType = keyof typeof statement;
export type PermissionAction<T extends StatementType> =
  (typeof statement)[T][number];
