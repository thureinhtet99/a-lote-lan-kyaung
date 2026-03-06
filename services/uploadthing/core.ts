import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { upsertUserResumeDb } from "@/features/applications/db/resume-db";
import { utapi } from "./client";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { getResumeFileKey } from "@/features/applications/db/application-db";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    pdf: {
      maxFileSize: "2MB",
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
      const resumeFileKey = await getResumeFileKey(userId);

      await upsertUserResumeDb(userId, {
        resumeFileUrl: file.ufsUrl,
        resumeFileKey: file.key,
        resumeFileName: file.name,
      });

      if (resumeFileKey != undefined) {
        await utapi.deleteFiles(resumeFileKey);
      }

      return { message: "Resume uploaded successfully" };
    }),

  // Temporary resume upload for a single application — does NOT save to profile
  applicationResumeUploader: f({
    pdf: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      if (userId == null) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        message: "Resume ready for application",
      };
    }),
} satisfies FileRouter;
