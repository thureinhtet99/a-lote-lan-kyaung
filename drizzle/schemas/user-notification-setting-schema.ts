import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { created_at, updated_at } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { userTable } from "./user-schema";

export const userNotificationSettingsTable = pgTable(
  "user_notification_settings",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => userTable.id, { onDelete: "cascade" }),
    newJobEmailNotification: boolean("new_job_email_notification")
      .notNull()
      .default(false),
    aiPrompt: text("ai_prompt"),
    created_at,
    updated_at,
  },
);

export const userNotificationSettingsRelations = relations(
  userNotificationSettingsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userNotificationSettingsTable.userId],
      references: [userTable.id],
    }),
  }),
);
