"use server";

import { db } from "@/lib/db";
import { userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateAdminStatsCache, revalidateUserCache } from "./cache/users";

export async function updateUser(
  id: string,
  user: typeof userTable.$inferInsert,
) {
  await db.update(userTable).set(user).where(eq(userTable.id, id));
  revalidateUserCache(id);
  revalidateAdminStatsCache();
}

export async function deleteUser(id: string) {
  await db.delete(userTable).where(eq(userTable.id, id));
  revalidateUserCache(id);
  revalidateAdminStatsCache();
}
