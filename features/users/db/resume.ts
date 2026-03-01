"use server";

import { db } from "@/lib/db";
import { resumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { resumeTag } from "@/lib/utils/data-cache";

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
  updateTag(resumeTag(userId));
}

export async function updateUserResumeDb(
  userId: string,
  data: Partial<Omit<typeof resumeTable.$inferInsert, "userId">>,
) {
  await db.update(resumeTable).set(data).where(eq(resumeTable.userId, userId));
  updateTag(resumeTag(userId));
}
