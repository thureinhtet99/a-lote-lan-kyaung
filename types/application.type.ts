import {
  jobListingApplicationsTable,
  userResumesTable,
  usersTable,
} from "@/drizzle/schema";
import { ReactNode } from "react";

export type ApplicationType = Pick<
  typeof jobListingApplicationsTable.$inferSelect,
  "jobListingId" | "rating" | "status" | "createdAt"
> & {
  coverLetterMarkDown: ReactNode | null;
  user: Pick<
    typeof usersTable.$inferSelect,
    "id" | "first_name" | "last_name" | "image"
  > & {
    resume:
      | (Pick<typeof userResumesTable.$inferSelect, "resumeFileUrl"> & {
          markdownSummary: ReactNode | null;
        })
      | null;
  };
};
