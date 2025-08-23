import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { organizationsTable } from "./organization";
import { createdAt, updatedAt } from "../schemaHelpers";
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
    newApplicationEmailNoti: boolean().notNull().default(false),
    minimumRating: integer(),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.organizationId] })]
);

export const organizationUserSettingRelations = relations(
  organizationUserSettingsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [organizationUserSettingsTable.userId],
      references: [usersTable.id],
    }),
    org: one(organizationsTable, {
      fields: [organizationUserSettingsTable.organizationId],
      references: [organizationsTable.id],
    }),
  })
);
