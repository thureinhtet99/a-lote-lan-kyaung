import { db } from "@/drizzle/db";
import { userNotificationSettingsTable } from "@/drizzle/schema";
import { revalidateUserNotiCache } from "./cache/userNotiSettings";

export async function insertUserNotiSettingsDb(
  settings: typeof userNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(userNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
  revalidateUserNotiCache(settings.userId);
}

export async function updateUserNotificationSettingDb(
  userId: string,
  settings: Partial<
    Omit<typeof userNotificationSettingsTable.$inferInsert, "userId">
  >
) {
  await db
    .insert(userNotificationSettingsTable)
    .values({ ...settings, userId })
    .onConflictDoUpdate({
      target: userNotificationSettingsTable.userId,
      set: settings,
    });
  revalidateUserNotiCache(userId);
}
