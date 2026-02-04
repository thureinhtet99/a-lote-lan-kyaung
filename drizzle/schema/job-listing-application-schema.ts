import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { jobListingsTable } from "./job-listing-schema";
import { user } from "./auth-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const applicationStatus = [
  "denied",
  "applied",
  "interested",
  "interviewed",
  "hired",
] as const;
export type ApplicationStatusType = (typeof applicationStatus)[number];
export const applicationStatusEnum = pgEnum(
  "application_status",
  applicationStatus,
);
export const jobListingApplicationsTable = pgTable(
  "job_listing_applications",
  {
    jobListingId: uuid()
      .references(() => jobListingsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: text()
      .references(() => user.id, {
        onDelete: "cascade",
      })
      .notNull(),
    coverLetter: text(),
    rating: integer(),
    status: applicationStatusEnum().notNull().default("applied"),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.jobListingId, table.userId] })],
);

export const jobListingApplicationsRelations = relations(
  jobListingApplicationsTable,
  ({ one }) => ({
    jobListing: one(jobListingsTable, {
      fields: [jobListingApplicationsTable.jobListingId],
      references: [jobListingsTable.id],
    }),
    user: one(user, {
      fields: [jobListingApplicationsTable.userId],
      references: [user.id],
    }),
  }),
);
