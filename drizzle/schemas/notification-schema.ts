import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { userTable } from "./user-schema";
import { organizationTable } from "./organization-schema";
import { relations } from "drizzle-orm";
import { created_at } from "../schema-helpers";

export const notificationTable = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["organization_approved", "organization_rejected", "info"],
    }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    organizationId: text("organization_id").references(
      () => organizationTable.id,
      { onDelete: "cascade" },
    ),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: created_at,
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [
    index("notification_userId_idx").on(table.userId),
    index("notification_isRead_idx").on(table.isRead),
  ],
);

export const notificationRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationTable.userId],
      references: [userTable.id],
    }),
    organization: one(organizationTable, {
      fields: [notificationTable.organizationId],
      references: [organizationTable.id],
    }),
  }),
);
