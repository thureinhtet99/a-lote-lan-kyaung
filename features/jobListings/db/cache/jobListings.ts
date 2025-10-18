import { jobListingGlobalTag, idTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingCache({
  jobListingId,
  organizationId,
}: {
  jobListingId?: string;
  organizationId: string;
}) {
  try {
    revalidateTag(jobListingGlobalTag(organizationId, "jobListings"));
    if (jobListingId) revalidateTag(idTag("jobListings", jobListingId));
  } catch (error) {
    console.error("Failed to revalidate job listing cache: ", error);
  }
}
