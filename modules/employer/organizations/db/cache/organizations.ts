import { idTag } from "@/lib/utils/data-cache";
import { revalidateTag } from "next/cache";

export function revalidateOrgCache(orgId: string) {
  revalidateTag(idTag("organizations", orgId));
}
