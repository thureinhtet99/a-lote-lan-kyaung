"use server";

import { db } from "@/lib/db";
import { resumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import { resumeTag } from "@/lib/data-cache";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { deleteUploadThingFile } from "@/services/uploadthing/delete-file";

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
    revalidateTag(resumeTag(userId), "max");
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
  revalidateTag(resumeTag(userId), "max");
}

export async function deleteCurrentUserResume() {
  try {
    const { userId } = await getCurrentUser();
    if (userId == null)
      return {
        success: false,
        message: "You don't have permission to delete this resume",
      };

    const existingResume = await db.query.resumeTable.findFirst({
      where: eq(resumeTable.userId, userId),
      columns: {
        resumeFileKey: true,
      },
    });

    if (!existingResume?.resumeFileKey)
      return {
        success: false,
        message: "No resume found to delete",
      };

    const deletedUploadThingFile = await deleteUploadThingFile(
      existingResume.resumeFileKey,
    );

    if (!deletedUploadThingFile.success)
      return {
        success: false,
        message: deletedUploadThingFile.message ?? "Failed to delete resume",
      };

    await db.delete(resumeTable).where(eq(resumeTable.userId, userId));

    updateTag(resumeTag(userId));
    revalidateTag(resumeTag(userId), "max");

    return {
      success: true,
      message: "Resume deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting current resume: ", error);
    return {
      success: false,
      message: "Failed to delete resume",
    };
  }
}
