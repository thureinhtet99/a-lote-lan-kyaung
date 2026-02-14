import { userResumeTag } from "@/lib/utils/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateUserResumeCache(userId: string) {
  try {
    if (userId) {
      revalidateTag(userResumeTag("userResumes", userId));
    }
  } catch (error) {
    console.error("Failed to revalidate user resume:", error);
  }
}
