import {
  getGlobalTag,
  getIdTag,
  getJobListingOrganizationTag,
} from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateJobListingCache({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  revalidateTag(getGlobalTag("jobListings"));
  revalidateTag(getIdTag("jobListings", id));
  revalidateTag(getJobListingOrganizationTag("jobListings", organizationId));
}
