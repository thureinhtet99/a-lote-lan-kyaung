import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const userNotificationSettingsTable = pgTable(
  "user_notification_settings",
  {
    userId: varchar()
      .primaryKey()
      .references(() => usersTable.id),
    newJobEmailNotification: boolean().notNull().default(false),
    aiPrompt: varchar(),
    createdAt,
    updatedAt,
  }
);

export const userNotiSettingsRelations = relations(
  userNotificationSettingsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userNotificationSettingsTable.userId],
      references: [usersTable.id],
    }),
  })
);
