import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { userTable } from "./auth-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const userNotificationSettingsTable = pgTable(
  "user_notification_settings",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => userTable.id, { onDelete: "cascade" }),
    newJobEmailNotification: boolean("new_job_email_notification")
      .notNull()
      .default(false),
    // aiPrompt: text("ai_prompt"),
    createdAt,
    updatedAt,
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
