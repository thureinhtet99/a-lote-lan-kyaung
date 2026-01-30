import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { jobListingsTable } from "./job-listing-schema";
import { usersTable } from "./users";
import { createdAt, updatedAt } from "../schemaHelpers";
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
    userId: varchar()
      .references(() => usersTable.id, {
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
    user: one(usersTable, {
      fields: [jobListingApplicationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);
