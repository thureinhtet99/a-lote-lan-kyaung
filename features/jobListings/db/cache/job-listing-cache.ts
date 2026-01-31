import { jobListingsTag, jobListingIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingCache({
  jobListingId,
  organizationId,
}: {
  jobListingId?: string;
  organizationId: string;
}) {
  try {
    revalidateTag(jobListingsTag(organizationId, "jobListings"));

    if (jobListingId)
      revalidateTag(
        jobListingIdTag(organizationId, "jobListings", jobListingId),
      );
  } catch (error) {
    console.error("Failed to revalidate job listing cache: ", error);
  }
}
