import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { userNotiSettingsTable } from "./userNotiSetting";
import { userResumesTable } from "./userResume";
import { organizationUserSettingsTable } from "./organizationUserSetting";

export const usersTable = pgTable("users", {
  id: varchar().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt,
  updatedAt,
});

export const userRelations = relations(usersTable, ({ one, many }) => ({
  notiSetting: one(userNotiSettingsTable),
  resume: one(userResumesTable),
  orgUserSetting: many(organizationUserSettingsTable),
}));
