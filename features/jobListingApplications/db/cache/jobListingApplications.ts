import { jobListingApplicationIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingApplicationCache({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) {
  try {
    revalidateTag(
      jobListingApplicationIdTag("jobListingApplications", jobListingId, userId)
    );
  } catch (error) {
    console.error(
      "Failed to revalidate job listing application cache: ",
      error
    );
  }
}
