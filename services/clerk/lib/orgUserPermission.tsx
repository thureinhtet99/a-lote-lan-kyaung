import { auth } from "@clerk/nextjs/server";

type UserPermissionType =
  | "job_listing_application:change_status"
  | "job_listing_application:change_rating"
  | "job_listing:change_status"
  | "job_listing:create"
  | "job_listing:update"
  | "job_listing:delete";

export async function hasOrgUserPermission(permission: UserPermissionType) {
  const { has } = await auth();  
  return has({ permission });
}
