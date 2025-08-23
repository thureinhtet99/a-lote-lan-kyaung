import { db } from "@/drizzle/db";
import { userNotiSettingsTable } from "@/drizzle/schema";
import { revalidateUserCache } from "./cache/users";

export async function insertUserNotiSettings(
  settings: typeof userNotiSettingsTable.$inferInsert
) {
  await db.insert(userNotiSettingsTable).values(settings).onConflictDoNothing();
  revalidateUserCache(settings.userId);
}
