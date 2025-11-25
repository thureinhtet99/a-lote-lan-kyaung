"use server";

import { db } from "@/drizzle/db";
import { userResumesTable } from "@/drizzle/schema";
import { revalidateUserResumeCache } from "./cache/userResumes";
import { eq } from "drizzle-orm";

export async function upsertUserResumeDb(
  userId: string,
  data: Omit<typeof userResumesTable.$inferInsert, "userId">
) {
  await db
    .insert(userResumesTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: userResumesTable.userId,
      set: data,
    });
  revalidateUserResumeCache(userId);
}

export async function updateUserResumeDb(
  userId: string,
  data: Partial<Omit<typeof userResumesTable.$inferInsert, "userId">>
) {
  await db
    .update(userResumesTable)
    .set(data)
    .where(eq(userResumesTable.userId, userId));
  revalidateUserResumeCache(userId);
}
