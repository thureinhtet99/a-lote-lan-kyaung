import { userNotificationTag } from "@/lib/utils/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateUserNotiCache(userId: string) {
  try {
    if (userId) {
      revalidateTag(userNotificationTag("userNotificationSettings", userId));
    }
  } catch (error) {
    console.error("Failed to revalidate user notifications:", error);
  }
}
