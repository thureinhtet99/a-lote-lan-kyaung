import { JobListingStatusType } from "@/drizzle/schema";
import { differenceInDays } from "date-fns";

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

export const getPostingJobLabel = (postedAt: Date) => {
  const daySincePosted = differenceInDays(postedAt, Date.now());
  if (daySincePosted === 0) return "New";

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daySincePosted, "days");
};
