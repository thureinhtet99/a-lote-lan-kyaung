import { jobListingApplicationIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingApplicationCache({
  jobListingId,
}: {
  jobListingId: string;
  userId: string;
}) {
  try {
    revalidateTag(
      jobListingApplicationIdTag("jobListingApplications", jobListingId)
    );
  } catch (error) {
    console.error(
      "Failed to revalidate job listing application cache: ",
      error
    );
  }
}
