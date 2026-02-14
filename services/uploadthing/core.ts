import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { upsertUserResumeDb } from "@/features/users/db/resume";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { resumeTable } from "@/drizzle/schema";
import { utapi } from "./client";
import { getCurrentUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      if (userId == null) throw new UploadThingError("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;
      const resumeFileKey = await getUserResumeFileKey(userId);

      await upsertUserResumeDb(userId, {
        resumeFileUrl: file.ufsUrl,
        resumeFileKey: file.key,
      });

      if (resumeFileKey != undefined) {
        await utapi.deleteFiles(resumeFileKey);
      }

      return { message: "Resume uploaded successfully" };
    }),
} satisfies FileRouter;

const getUserResumeFileKey = async (userId: string) => {
  const data = await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
    columns: { resumeFileKey: true },
  });

  return data?.resumeFileKey;
};

export type OurFileRouter = typeof ourFileRouter;
