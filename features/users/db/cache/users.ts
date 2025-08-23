import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateUserCache(id: string) {
  revalidateTag(getGlobalTag("users"));
  revalidateTag(getIdTag("users", id));
}
