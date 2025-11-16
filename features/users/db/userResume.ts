"use server";

import { db } from "@/drizzle/db";
import { userResumesTable } from "@/drizzle/schema";
import { revalidateUserResumeCache } from "./cache/userResumes";

export default async function upsertUserResume(
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
