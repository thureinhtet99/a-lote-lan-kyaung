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
import { userResumeTag } from "@/lib/utils/data-cache";
import DropzoneClient from "./_DropzoneClient";

export default function ResumePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Upload your resume</h1>

      <Card>
        <CardContent className="pt-6">
          <DropzoneClient />
        </CardContent>
        <Suspense fallback={<Loading />}>
          <SuspendedComponent />
        </Suspense>
      </Card>

      {/* AI */}
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
}

const SuspendedComponent = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getCurrentResume(userId);
  if (userResume == undefined) return null;

  return (
    <CardFooter>
      <Button asChild>
        <Link
          href={userResume.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </Link>
      </Button>
    </CardFooter>
  );
};

// Fetch user resume from db (cached)
async function getResumeByUserId(userId: string) {
  "use cache";
  cacheTag(userResumeTag(userId));
  cacheLife("hours");
  return await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
  });
}

const getCurrentResume = async (userId: string) => {
  const data = await getResumeByUserId(userId);
  return data;
};

const AISummaryCard = async () => {
  // const { userId } = await getCurrentUser();
  const userId = "5g4X3I2v2EVlFXUb0SrcBRBtQZPtOj80";
  if (userId == null) return notFound();

  const userResume = await getCurrentResume(userId);
  if (userResume == undefined) return null;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>AI Summary </CardTitle>
        <CardDescription>
          This is an AI-generated summary of our resume. This is used by
          employers to quickly understand your qualifications and experiences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <MarkdownRenderer source={userResume.aiSummary ?? "No summary"} /> */}
        <MarkdownRenderer source={"No summary"} />
      </CardContent>
    </Card>
  );
};
