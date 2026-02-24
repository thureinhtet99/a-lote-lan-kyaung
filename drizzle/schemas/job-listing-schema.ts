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
import { created_at, id, updated_at } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { applicationTable } from "./application-schema";
import { organizationTable } from "./auth-schema";

export const wageIntervals = ["monthly", "yearly", "hourly"] as const;
export type WageIntervalType = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum("wage_interval", wageIntervals);

export const locationRequirements = ["on-site", "hybrid", "remote"] as const;
export type LocationRequirementType = (typeof locationRequirements)[number];
export const locationRequirementEnum = pgEnum(
  "location_requirement",
  locationRequirements,
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

export const jobListingTable = pgTable(
  "job_listings",
  {
    id,
    organizationId: text("organization_id")
      .references(() => organizationTable.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    wage: integer().notNull(),
    wageInterval: wageIntervalEnum().notNull(),
    state: varchar(),
    city: varchar(),
    isFeatured: boolean("is_featured").notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    status: jobListingStatusEnum().notNull().default("draft"),
    type: jobListingTypeEnum().notNull(),
    posted_at: timestamp("posted_at", { withTimezone: true }),
    created_at,
    updated_at,
  },
  (table) => [index().on(table.state)],
);

export const jobListingsRelations = relations(
  jobListingTable,
  ({ one, many }) => ({
    organization: one(organizationTable, {
      fields: [jobListingTable.organizationId],
      references: [organizationTable.id],
    }),
    applications: many(applicationTable),
  }),
);
