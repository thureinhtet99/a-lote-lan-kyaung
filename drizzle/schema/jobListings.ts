import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { organizationsTable } from "./organizations";
import { relations } from "drizzle-orm";
import { jobListingApplicationsTable } from "./jobListingApplications";

export const wageIntervals = ["monthly", "yearly", "hourly"] as const;
export type WageIntervalType = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum("wage_interval", wageIntervals);

export const locationRequirements = ["on-site", "hybrid", "remote"] as const;
export type LocationRequirementType = (typeof locationRequirements)[number];
export const locationRequirementEnum = pgEnum(
  "location_requirement",
  locationRequirements
);

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevelType = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum("experience", experienceLevels);

export const jobListingStatuses = ["draft", "published", "delisted"] as const;
export type JobListingStatusType = (typeof jobListingStatuses)[number];
export const jobListingStatusEnum = pgEnum("status", jobListingStatuses);

export const jobListingTypes = [
  "full-time",
  "part-time",
  "internship",
] as const;
export type JobListingTypeType = (typeof jobListingTypes)[number];
export const jobListingTypeEnum = pgEnum("type", jobListingTypes);

export const jobListingsTable = pgTable(
  "job_listings",
  {
    id,
    organizationId: varchar({ length: 255 })
      .references(() => organizationsTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    wage: integer().notNull(),
    wageInterval: wageIntervalEnum().notNull(),
    state: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    status: jobListingStatusEnum().notNull().default("draft"),
    type: jobListingTypeEnum().notNull(),
    postedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [index().on(table.state)]
);

export const jobListingsRelations = relations(
  jobListingsTable,
  ({ one, many }) => ({
    organization: one(organizationsTable, {
      fields: [jobListingsTable.organizationId],
      references: [organizationsTable.id],
    }),
    applications: many(jobListingApplicationsTable),
  })
);
