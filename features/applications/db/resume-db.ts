"use server";

import { db } from "@/lib/db";
import { resumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { resumeTag } from "@/lib/data-cache";

export const getCurrentResume = async (userId: string) => {
  try {
    return getCurrentResumeCached(userId);
  } catch (error) {
    console.error("Error fetching current resume: ", error);
    return {
      success: false,
      message: "Failed to fetch current resume",
    };
  }
};

const getCurrentResumeCached = async (userId: string) => {
  "use cache";
  cacheTag(resumeTag(userId));
  cacheLife("max");

  const result = await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
  });

  if (!result)
    return {
      success: false,
      message: "Error fetching resume by user",
    };

  return {
    success: true,
    message: "Current resume fetched successfully",
    data: result,
  };
};

export async function upsertUserResumeDb(
  userId: string,
  data: Omit<typeof resumeTable.$inferInsert, "userId">,
) {
  try {
    await db
      .insert(resumeTable)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: resumeTable.userId,
        set: data,
      });
    updateTag(resumeTag(userId));
  } catch (error) {
    console.error("Error uploading resume: ", error);
    return {
      success: false,
      message: "Failed to upload resume",
    };
  }
}

export async function updateUserResumeDb(
  userId: string,
  data: Partial<Omit<typeof resumeTable.$inferInsert, "userId">>,
) {
  await db.update(resumeTable).set(data).where(eq(resumeTable.userId, userId));
  updateTag(resumeTag(userId));
}
