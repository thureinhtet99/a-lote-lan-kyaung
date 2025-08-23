import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { jobListingsTable } from "./jobListing";
import { usersTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const applicationStages = [
  "denied",
  "applied",
  "interested",
  "interviewed",
  "hired",
] as const;
export type ApplicationStageType = (typeof applicationStages)[number];
export const applciatonStageEnum = pgEnum(
  "application_stage",
  applicationStages
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
    stage: applciatonStageEnum().notNull().default("applied"),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.jobListingId, table.userId] })]
);

export const jobListingApplicationRelations = relations(
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
  })
);
