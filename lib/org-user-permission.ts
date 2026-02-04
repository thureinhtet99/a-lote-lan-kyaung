import { db } from "@/drizzle/db";
import { member } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "./auth-helpers";

export type UserPermissionType =
  | "org:job_listing:create"
  | "org:job_listing:update"
  | "org:job_listing:delete"
  | "org:application:read"
  | "org:application:update"
  | "org:member:invite"
  | "org:member:remove";

const rolePermissions: Record<string, UserPermissionType[]> = {
  admin: [
    "org:job_listing:create",
    "org:job_listing:update",
    "org:job_listing:delete",
    "org:application:read",
    "org:application:update",
    "org:member:invite",
    "org:member:remove",
  ],
  member: [
    "org:job_listing:create",
    "org:job_listing:update",
    "org:application:read",
    "org:application:update",
  ],
};

export async function hasOrgUserPermission(permission: UserPermissionType) {
  const session = await getSession();

  if (!session) {
    return false;
  }

  const activeOrgId = session.session.activeOrganizationId as
    | string
    | undefined;

  if (!activeOrgId) {
    return false;
  }

  // Get user's role in the organization
  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, session.user.id),
      eq(member.organizationId, activeOrgId),
    ),
  });

  if (!membership) {
    return false;
  }

  // Check if role has the required permission
  const permissions = rolePermissions[membership.role] || [];
  return permissions.includes(permission);
}
