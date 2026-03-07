import { db } from "@/lib/db";
import { notificationSettingsTable } from "@/drizzle/schema";
import { updateTag } from "next/cache";
import { userNotificationTag } from "@/lib/data-cache";

export async function insertUserNotiSettingsDb(
  settings: typeof notificationSettingsTable.$inferInsert,
) {
  await db
    .insert(notificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
  updateTag(userNotificationTag(settings.userId));
}

export async function updateUserNotificationSettingDb(
  userId: string,
  settings: Partial<
    Omit<typeof notificationSettingsTable.$inferInsert, "userId">
  >,
) {
  await db
    .insert(notificationSettingsTable)
    .values({ ...settings, userId })
    .onConflictDoUpdate({
      target: notificationSettingsTable.userId,
      set: settings,
    });
  updateTag(userNotificationTag(userId));
}
