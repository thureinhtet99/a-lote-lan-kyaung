import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import DropzoneClient from "./_DropzoneClient";
import { getCurrentResume } from "@/features/applications/db/resume-db";
import ResumeViewerClient from "./_ResumeViewerClient";

export default function ResumePage() {
  return (
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Resume</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage your resume
        </p>
      </div>

      <DropzoneClient />
      <Suspense>
        <ResumeViewer />
      </Suspense>

      {/* AI */}
      <Suspense>
        <AISummary />
      </Suspense>
    </div>
  );
}

const ResumeViewer = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getCurrentResume(userId);
  if (!userResume.data) return null;

  return (
    <ResumeViewerClient
      resumeFileUrl={userResume.data.resumeFileUrl}
      resumeFileName={userResume.data.resumeFileName}
      uploadedAt={
        userResume.data.updatedAt instanceof Date
          ? userResume.data.updatedAt.toISOString()
          : userResume.data.updatedAt
            ? String(userResume.data.updatedAt)
            : null
      }
    />
  );
};

const AISummary = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getCurrentResume(userId);
  if (!userResume.data) return null;

  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Coming soon..... You will get an auto-generated ai summary from your
          uploaded resume here.
        </p>
      </CardContent>
    </Card>
  );
};
