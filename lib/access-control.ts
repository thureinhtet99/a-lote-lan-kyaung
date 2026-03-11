import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  organization: ["create", "update", "delete", "switch", "read"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_status"],
  member: ["invite", "remove", "update_role", "create", "update", "delete"],
  invitation: ["create", "cancel"],
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

// HR - basic organization role for managing job postings and applications
export const hr = ac.newRole({
  organization: ["read"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_status"],
});

// Org Admin - full organization management role
export const orgAdmin = ac.newRole({
  organization: ["create", "read", "update", "delete", "switch"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_status"],
  member: ["invite", "remove", "update_role", "create", "update", "delete"],
  invitation: ["create", "cancel"],
});

// Export permission types for use throughout the app
export type StatementType = keyof typeof statement;
export type PermissionAction<T extends StatementType> =
  (typeof statement)[T][number];
