import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { resumeTable } from "@/drizzle/schema";
import MarkdownRenderer from "@/components/markdown/markdown-renderer";
import Loading from "@/components/shared/loading";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { cacheLife, cacheTag } from "next/cache";
import { resumeTag } from "@/lib/data-cache";
import DropzoneClient from "./_DropzoneClient";
import { getCurrentResume } from "@/features/applications/db/resume-db";

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
        <SuspendedComponent />
      </Suspense>

      {/* AI */}
      <Suspense>
        <AISummary />
      </Suspense>
    </div>
  );
}

const SuspendedComponent = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getCurrentResume(userId);
  if (!userResume.data) return null;

  return (
    <Button asChild>
      <Link
        href={userResume.data.resumeFileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Resume
      </Link>
    </Button>
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
          Coming soon..... You will get an auto-generated summary from your
          uploaded resume here.
        </p>
      </CardContent>
    </Card>
  );
};
