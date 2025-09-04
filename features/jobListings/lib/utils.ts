import { JobListingStatusType } from "@/drizzle/schema";

export const getNextJobListingStatus = (status: JobListingStatusType) => {
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
