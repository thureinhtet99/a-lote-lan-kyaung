import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { created_at, updated_at } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { jobListingTable } from "./job-listing-schema";
import { userTable } from "./user-schema";

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
export const applicationTable = pgTable(
  "applications",
  {
    jobListingId: text("job_listing_id")
      .references(() => jobListingTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: text("user_id")
      .references(() => userTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    coverLetter: text("cover_letter"),
    rating: integer(),
    status: applicationStatusEnum().notNull().default("applied"),
    created_at,
    updated_at,
  },
  (table) => [primaryKey({ columns: [table.jobListingId, table.userId] })],
);

export const jobListingApplicationsRelations = relations(
  applicationTable,
  ({ one }) => ({
    jobListing: one(jobListingTable, {
      fields: [applicationTable.jobListingId],
      references: [jobListingTable.id],
    }),
    user: one(userTable, {
      fields: [applicationTable.userId],
      references: [userTable.id],
    }),
  }),
);
