import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { jobListingsTable } from "./job-listing-schema";
import { organizationUserSettingsTable } from "./organization-user-setting-schema";

export const organizationsTable = pgTable("organizations", {
  id: varchar().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  image: varchar(),
  createdAt,
  updatedAt,
});

export const organizationRelations = relations(
  organizationsTable,
  ({ many }) => ({
    jobListings: many(jobListingsTable),
    organizationUserSettings: many(organizationUserSettingsTable),
  }),
);
