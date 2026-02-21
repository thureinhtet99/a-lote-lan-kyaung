import { tag, idTag } from "@/lib/utils/data-cache";
import { revalidateTag } from "next/cache";

export function revalidateUserCache(userId: string) {
  try {
    if (userId) revalidateTag(idTag("users", userId));
  } catch (error) {
    console.error("Failed to revalidate user cache:", error);
  }
}

export function revalidateAdminStatsCache() {
  try {
    revalidateTag(tag("admin-stats"));
  } catch (error) {
    console.error("Failed to revalidate admin stats cache:", error);
  }
}
