import { JobListingStatusType } from "@/drizzle/schema";

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

const jobListingStatusSortOrder: Record<JobListingStatusType, number> = {
  published: 0,
  draft: 1,
  delisted: 2,
};

export const sortJobListingsByStatus = (
  a: JobListingStatusType,
  b: JobListingStatusType
) => {
  return jobListingStatusSortOrder[a] - jobListingStatusSortOrder[b];
};
