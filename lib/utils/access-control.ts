import { createAccessControl } from "better-auth/plugins/access";

/**
 * Access Control definitions for better-auth organization plugin
 * This file contains AC configuration and role definitions only (no server functions)
 */

export const statement = {
  organization: ["create", "update", "delete", "switch"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

// User (basic member)
export const user = ac.newRole({
  job_listing: ["create", "update"],
  application: ["read", "update"],
});

// Admin
export const admin = ac.newRole({
  organization: ["update"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

// Owner
export const owner = ac.newRole({
  organization: ["create", "update", "delete"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

// Export permission types for use throughout the app
export type StatementType = keyof typeof statement;
export type PermissionAction<T extends StatementType> =
  (typeof statement)[T][number];
