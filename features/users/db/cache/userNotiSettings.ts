import { userNotiTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateUserNotiCache(userId: string) {
  try {
    if (userId) {
      revalidateTag(userNotiTag("userNotificationSettings", userId));
    }
  } catch (error) {
    console.error("Failed to revalidate user notifications:", error);
  }
}
