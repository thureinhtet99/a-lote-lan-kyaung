import { db } from "@/lib/db";
import { memberTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "../auth/auth";

export type UserPermissionType =
  | "owner.update"
  | "organization.create"
  | "organization.delete"
  | "organization.update"
  | "job_listing.create"
  | "job_listing.update"
  | "job_listing.delete"
  | "job_listing.change_status"
  | "application.read"
  | "application.update"
  | "application.change_rating"
  | "application.change_status"
  | "member.invite"
  | "member.remove";

// Role-based permissions mapping
const rolePermissions: Record<string, UserPermissionType[]> = {
  owner: [
    "owner.update",
    "organization.create",
    "organization.delete",
    "organization.update",
    "job_listing.create",
    "job_listing.update",
    "job_listing.delete",
    "job_listing.change_status",
    "application.read",
    "application.update",
    "application.change_rating",
    "application.change_status",
    "member.invite",
    "member.remove",
  ],
  admin: [
    "job_listing.create",
    "job_listing.update",
    "job_listing.delete",
    "job_listing.change_status",
    "application.read",
    "application.update",
    "application.change_rating",
    "application.change_status",
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

const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
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
  const membership = await db.query.memberTable.findFirst({
    where: and(
      eq(memberTable.userId, session.user.id),
      eq(memberTable.organizationId, activeOrgId),
    ),
  });

  if (!membership) {
    return false;
  }

  // Check if the user's role has the required permission
  const permissions = rolePermissions[membership.role] || [];
  return permissions.includes(permission);
}

// import { createAccessControl } from "better-auth/plugins/access";

// /**
//  * make sure to use `as const` so typescript can infer the type correctly
//  */
// const statement = {
//   project: ["create", "share", "update", "delete"],
// } as const;

// export const ac = createAccessControl(statement);

// export const member = ac.newRole({
//   //   organization: ["create"],
//   project: ["create"],
// });
// export const admin = ac.newRole({
//   project: ["create", "update"],
// });
// export const owner = ac.newRole({
//   project: ["create", "update", "delete"],
// });
