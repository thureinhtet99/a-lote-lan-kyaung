import {
  getGlobalTag,
  getIdTag,
  getJobListingApplicationTag,
} from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingApplicationCache({
  id,
  jobListingId,
  userId,
}: {
  id: string;
  jobListingId: string;
  userId?: string;
}) {
  revalidateTag(getGlobalTag("jobListingApplications"));
  revalidateTag(getIdTag("jobListingApplications", id));
  revalidateTag(
    getJobListingApplicationTag(
      "jobListingApplications",
      jobListingId,
      userId || ""
    )
  );
}
