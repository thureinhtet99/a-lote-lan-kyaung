import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { userNotificationSettingsTable } from "./userNotiSettings";
import { userResumesTable } from "./userResumes";
import { organizationUserSettingsTable } from "./organizationUserSettings";

export const usersTable = pgTable("users", {
  id: varchar().primaryKey(),
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  image: varchar({ length: 255 }).notNull(),
  createdAt,
  updatedAt,
});

export const userRelations = relations(usersTable, ({ one, many }) => ({
  userNotificationSetting: one(userNotificationSettingsTable),
  resume: one(userResumesTable),
  orgUserSettings: many(organizationUserSettingsTable),
}));
