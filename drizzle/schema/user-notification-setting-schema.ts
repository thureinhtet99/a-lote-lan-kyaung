import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const userNotificationSettingsTable = pgTable(
  "user_notification_settings",
  {
    userId: text()
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    newJobEmailNotification: boolean().notNull().default(false),
    aiPrompt: text(),
    createdAt,
    updatedAt,
  },
);

export const userNotiSettingsRelations = relations(
  userNotificationSettingsTable,
  ({ one }) => ({
    user: one(user, {
      fields: [userNotificationSettingsTable.userId],
      references: [user.id],
    }),
  }),
);
