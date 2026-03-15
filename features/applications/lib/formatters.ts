import { ApplicationStatusType } from "@/drizzle/schema";

export const formatApplicationStatus = (status: ApplicationStatusType) => {
  switch (status) {
    case "applied":
      return "Applied";
    case "interested":
      return "Interested";
    case "denied":
      return "Denied";
    case "interviewed":
      return "Interviewed";
    case "hired":
      return "Hired";
    default:
      throw new Error(`Unknown application status ${status satisfies never}`);
  }
};
