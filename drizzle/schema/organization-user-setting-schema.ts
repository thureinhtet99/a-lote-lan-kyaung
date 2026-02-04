import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user-schema";
import { organizationsTable } from "./organization-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const organizationUserSettingsTable = pgTable(
  "organization_user_settings",
  {
    userId: varchar()
      .notNull()
      .references(() => usersTable.id),
    organizationId: varchar()
      .notNull()
      .references(() => organizationsTable.id),
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
    user: one(usersTable, {
      fields: [organizationUserSettingsTable.userId],
      references: [usersTable.id],
    }),
    organization: one(organizationsTable, {
      fields: [organizationUserSettingsTable.organizationId],
      references: [organizationsTable.id],
    }),
  }),
);
