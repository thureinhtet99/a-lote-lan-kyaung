import { getSession } from "./auth-helpers";
import { db } from "@/drizzle/db";
import { member } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export type UserPermissionType =
  | "job_listing.create"
  | "job_listing.update"
  | "job_listing.delete"
  | "application.read"
  | "application.update"
  | "member.invite"
  | "member.remove";

// Role-based permissions mapping
const rolePermissions: Record<string, UserPermissionType[]> = {
  admin: [
    "job_listing.create",
    "job_listing.update",
    "job_listing.delete",
    "application.read",
    "application.update",
    "member.invite",
    "member.remove",
  ],
  member: [
    "job_listing.create",
    "job_listing.update",
    "application.read",
    "application.update",
  ],
};

export async function hasOrgUserPermission(
  permission: UserPermissionType,
): Promise<boolean> {
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

  // Get user's role in the organization from database
  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, session.user.id),
      eq(member.organizationId, activeOrgId),
    ),
  });

  if (!membership) {
    return false;
  }

  // Check if the user's role has the required permission
  const permissions = rolePermissions[membership.role] || [];
  return permissions.includes(permission);
}
