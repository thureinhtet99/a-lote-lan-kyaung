import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

// export function getGlobalUserTag() {
//   return getGlobalTag("users");
// }

// export function getUserIdTag(id: string) {
//   return getIdTag("users", id);
// }

export function revalidateJobListingCache({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) {
  revalidateTag(getGlobalTag("jobListings"));
  revalidateTag(getIdTag("jobListings", id));
  revalidateTag(getOrganizationTag("jobListings", organizationId));
}
