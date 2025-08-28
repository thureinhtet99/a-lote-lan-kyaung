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
import { organizationsTable } from "./organization";
import { relations } from "drizzle-orm";
import { jobListingApplicationsTable } from "./jobListingApplication";

export const wageIntervals = ["monthly", "yearly", "hourly"] as const;
export type WageIntervalType = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum(
  "job_listing_wage_interval",
  wageIntervals
);

export const locationRequirements = ["on-site", "hybrid", "remote"] as const;
export type LocationRequirementType = (typeof locationRequirements)[number];
export const locationRequirementEnum = pgEnum(
  "job_listing_location_requirement",
  locationRequirements
);

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevelType = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum(
  "job_listing_experience_level",
  experienceLevels
);

export const jobListingStatuses = ["draft", "published", "delisted"] as const;
export type JobListingStatusType = (typeof jobListingStatuses)[number];
export const jobListingStatusEnum = pgEnum(
  "job_listing_status",
  jobListingStatuses
);

export const jobListingTypes = [
  "internship",
  "part-time",
  "full-time",
] as const;
export type JobListingTypeType = (typeof jobListingTypes)[number];
export const jobListingTypeEnum = pgEnum("job_listing_types", jobListingTypes);

export const jobListingsTable = pgTable(
  "job_listings",
  {
    id,
    organizationId: varchar({ length: 255 })
      .references(() => organizationsTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    wage: integer(),
    wageIntervel: wageIntervalEnum(),
    stateAbbreviation: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationRequirement: locationRequirementEnum(),
    experienceLevel: experienceLevelEnum(),
    status: jobListingStatusEnum().notNull().default("draft"),
    type: jobListingTypeEnum(),
    posted: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [index().on(table.stateAbbreviation)]
);

export const jobListingRelations = relations(
  jobListingsTable,
  ({ one, many }) => ({
    organization: one(organizationsTable, {
      fields: [jobListingsTable.organizationId],
      references: [organizationsTable.id],
    }),
    applications: many(jobListingApplicationsTable),
  })
);
