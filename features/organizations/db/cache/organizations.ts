import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

// export function getGlobalUserTag() {
//   return getGlobalTag("users");
// }

// export function getUserIdTag(id: string) {
//   return getIdTag("users", id);
// }

export function revalidateOrgCache(id: string) {
  revalidateTag(getGlobalTag("organizations"));
  revalidateTag(getIdTag("organizations", id));
}
