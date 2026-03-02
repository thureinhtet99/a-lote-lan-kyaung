import { getCurrentUser } from "@/lib/auth/auth-helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { differenceInDays } from "date-fns";
import { connection } from "next/server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getApplicationByUserId,
  getResume,
} from "@/features/applications/db/application-db";
import { NewJobListingApplicationForm } from "@/features/applications/components/new-job-listing-application-form";
import { APP_ROUTES } from "@/constants/app-config";
import Link from "next/link";

export default async function JobApplyButton({
  jobListingId,
}: {
  jobListingId: string;
}) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply job here</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to create an account before applying for a job
          <Button asChild>
            <Link href={APP_ROUTES.SIGN_IN}>Sign in</Link>
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  const application = await getApplicationByUserId({ jobListingId, userId });
  if (application.success && application.data) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: "short",
      numeric: "always",
    });

    await connection();
    const difference = differenceInDays(
      application.data.created_at,
      new Date(),
    );

    return (
      <div className="text-muted-foreground text-sm">
        You applied for this job{" "}
        {difference === 0 ? "today" : formatter.format(difference, "days")}
      </div>
    );
  }

  const resume = await getResume(userId);
  if (!resume.success || !resume.data) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply job here</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to upload your resume before applying for a job
          <Button asChild>
            <Link href={APP_ROUTES.SETTINGS.RESUME}>Upload Resume</Link>
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply job here</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-4xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Application</DialogTitle>
          <DialogDescription>
            Applying for a job cannot be undone and is something you can do once
            per job listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <NewJobListingApplicationForm jobListingId={jobListingId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
