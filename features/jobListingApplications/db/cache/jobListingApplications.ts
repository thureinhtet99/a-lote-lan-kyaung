import { applicationIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingApplicationCache({
  orgId,
  jobListingId,
  userId,
}: {
  orgId: string;
  jobListingId: string;
  userId?: string;
}) {
  revalidateTag(applicationIdTag(orgId, jobListingId, userId || ""));
}
