import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const userNotiSettingsTable = pgTable("user_noti_settings", {
  userId: varchar()
    .primaryKey()
    .references(() => usersTable.id),
  newJobEmailNoti: boolean().notNull().default(false),
  aiPrompt: varchar(),
  createdAt,
  updatedAt,
});

export const userNotiSettingsRelations = relations(
  userNotiSettingsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userNotiSettingsTable.userId],
      references: [usersTable.id],
    }),
  })
);
