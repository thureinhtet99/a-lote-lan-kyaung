import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateOrgCache(id: string) {
  revalidateTag(getGlobalTag("organizations"));
  revalidateTag(getIdTag("organizations", id));
}
