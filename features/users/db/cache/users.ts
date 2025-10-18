import { idTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateUserCache(userId: string) {
  try {
    if (userId) revalidateTag(idTag("users", userId));
  } catch (error) {
    console.error("Failed to revalidate user cache:", error);
  }
}
