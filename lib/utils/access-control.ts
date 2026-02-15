import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  organization: ["create", "update", "delete", "switch", "read"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

// User
export const user = ac.newRole({
  job_listing: ["create", "update"],
  application: ["read", "update"],
});

// Member
export const member = ac.newRole({
  organization: ["read"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
});

// Owner
export const owner = ac.newRole({
  organization: ["create", "read", "update", "delete"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

// Export permission types for use throughout the app
export type StatementType = keyof typeof statement;
export type PermissionAction<T extends StatementType> =
  (typeof statement)[T][number];
