"use server";

import { db } from "@/drizzle/db";
import { resumeTable } from "@/drizzle/schema";
import { revalidateUserResumeCache } from "./cache/userResumes";
import { eq } from "drizzle-orm";

export async function upsertUserResumeDb(
  userId: string,
  data: Omit<typeof resumeTable.$inferInsert, "userId">,
) {
  await db
    .insert(resumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: resumeTable.userId,
      set: data,
    });
  revalidateUserResumeCache(userId);
}

export async function updateUserResumeDb(
  userId: string,
  data: Partial<Omit<typeof resumeTable.$inferInsert, "userId">>,
) {
  await db.update(resumeTable).set(data).where(eq(resumeTable.userId, userId));
  revalidateUserResumeCache(userId);
}
