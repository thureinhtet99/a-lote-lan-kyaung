import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const organizationUserSettingsTable = pgTable(
  "organization_user_settings",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    newApplicationEmailNotification: boolean().notNull().default(false),
    minimumRating: integer(),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.organizationId] })],
);

export const organizationUserSettingsRelations = relations(
  organizationUserSettingsTable,
  ({ one }) => ({
    user: one(user, {
      fields: [organizationUserSettingsTable.userId],
      references: [user.id],
    }),
    organization: one(organization, {
      fields: [organizationUserSettingsTable.organizationId],
      references: [organization.id],
    }),
  }),
);
