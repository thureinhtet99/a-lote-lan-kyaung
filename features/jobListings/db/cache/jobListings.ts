import {
  getGlobalTag,
  getIdTag,
  getJobListingOrganizationTag,
} from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingCache({
  id,
  jobListingId,
  organizationId,
}: {
  id: string;
  jobListingId: string;
  organizationId: string;
}) {
  revalidateTag(getGlobalTag("jobListings"));
  revalidateTag(getIdTag("jobListings", id));
  revalidateTag(getJobListingOrganizationTag("jobListings",jobListingId, organizationId));
}
