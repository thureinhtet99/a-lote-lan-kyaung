import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { organizationTable, userTable } from "./auth-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const organizationUserSettingsTable = pgTable(
  "organization_user_settings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationTable.id, { onDelete: "cascade" }),
    newApplicationEmailNotification: boolean(
      "new_application_email_notification",
    )
      .notNull()
      .default(false),
    minimumRating: integer(),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.organizationId] })],
);

export const organizationUserSettingsRelations = relations(
  organizationUserSettingsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [organizationUserSettingsTable.userId],
      references: [userTable.id],
    }),
    organization: one(organizationTable, {
      fields: [organizationUserSettingsTable.organizationId],
      references: [organizationTable.id],
    }),
  }),
);
