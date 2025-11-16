import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/getCurrentAuth";
import upsertUserResume from "@/features/users/db/userResume";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { userResumesTable } from "@/drizzle/schema";
import { utapi } from "./client";

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

      await upsertUserResume(userId, {
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
  const data = await db.query.userResumesTable.findFirst({
    where: eq(userResumesTable.userId, userId),
    columns: { resumeFileKey: true },
  });

  return data?.resumeFileKey;
};

export type OurFileRouter = typeof ourFileRouter;
