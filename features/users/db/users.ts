"use server";

import { db } from "@/drizzle/db";
import { usersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./cache/users";

export async function insertUser(user: typeof usersTable.$inferInsert) {
  await db.insert(usersTable).values(user).onConflictDoNothing();
  revalidateUserCache(user.id);
}

export async function updateUser(
  id: string,
  user: typeof usersTable.$inferInsert
) {
  await db.update(usersTable).set(user).where(eq(usersTable.id, id));
  revalidateUserCache(id);
}

export async function deleteUser(id: string) {
  await db.delete(usersTable).where(eq(usersTable.id, id));
  revalidateUserCache(id);
}

//  const existingUser = await db
//     .select()
//     .from(usersTable)
//     .where(eq(usersTable.id, user.id));

//   if (existingUser.length === 0) {
//   }
