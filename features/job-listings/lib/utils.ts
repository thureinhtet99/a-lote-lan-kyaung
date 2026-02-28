import { JobListingStatusType } from "@/drizzle/schema";
import { EyeIcon } from "lucide-react";

export const nextJobListingStatus = (status: JobListingStatusType) => {
  switch (status) {
    case "delisted":
    case "draft":
      return "published";
    case "published":
      return "delisted";
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
};

export const sortJobListingsByStatus = (
  a: JobListingStatusType,
  b: JobListingStatusType,
) => {
  return jobListingStatusSortOrder[a] - jobListingStatusSortOrder[b];
};

const jobListingStatusSortOrder: Record<JobListingStatusType, number> = {
  published: 0,
  draft: 1,
  delisted: 2,
};
