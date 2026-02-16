import { jobListingApplicationsTag } from "@/lib/utils/data-cache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingApplicationCache({
  jobListingId,
}: {
  jobListingId: string;
  userId: string;
}) {
  try {
    revalidateTag(jobListingApplicationsTag("applications", jobListingId));
  } catch (error) {
    console.error(
      "Failed to revalidate job listing application cache: ",
      error,
    );
  }
}
