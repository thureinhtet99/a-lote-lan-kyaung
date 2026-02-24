import { db } from "@/lib/db";
import { userNotificationSettingsTable } from "@/drizzle/schema";
import { updateTag } from "next/cache";

export async function insertUserNotiSettingsDb(
  settings: typeof userNotificationSettingsTable.$inferInsert,
) {
  await db
    .insert(userNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
  updateTag(`users-${settings.userId}`);
}

export async function updateUserNotificationSettingDb(
  userId: string,
  settings: Partial<
    Omit<typeof userNotificationSettingsTable.$inferInsert, "userId">
  >,
) {
  await db
    .insert(userNotificationSettingsTable)
    .values({ ...settings, userId })
    .onConflictDoUpdate({
      target: userNotificationSettingsTable.userId,
      set: settings,
    });
  updateTag(`users-${userId}`);
}
