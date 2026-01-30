import { UserPermissionType } from "@/types/user-permission.type";
import { auth } from "@clerk/nextjs/server";

export async function hasOrgUserPermission(permission: UserPermissionType) {
  const { has } = await auth();

  return has({ permission });
}
