import { getPostingJobLabel } from "@/features/job-listings/lib/utils";

export default function DaySincePosting({ postedAt }: { postedAt: Date }) {
  const label = getPostingJobLabel(postedAt);
  if (label === "New") return "New";

  return label;
}
