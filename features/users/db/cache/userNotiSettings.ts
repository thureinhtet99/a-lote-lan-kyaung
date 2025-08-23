import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserNotiSettingGlobalTag() {
  return getGlobalTag("userNotificationSettings");
}

export function getUserNotiSettingIdTag(userId: string) {
  return getIdTag("userNotificationSettings", userId);
}
export function revalidateUserNotiSettingCache(userId: string) {
  revalidateTag(getUserNotiSettingGlobalTag());
  revalidateTag(getUserNotiSettingIdTag(userId));
}
