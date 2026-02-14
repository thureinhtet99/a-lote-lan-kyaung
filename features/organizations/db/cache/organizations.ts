import { idTag } from "@/lib/utils/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateOrgCache(orgId: string) {
  revalidateTag(idTag("organizations", orgId));
}
