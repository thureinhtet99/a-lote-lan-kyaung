import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { jobListingsTable } from "./jobListings";
import { organizationUserSettingsTable } from "./organizationUserSettings";

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
  })
);
