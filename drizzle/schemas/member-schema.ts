import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizationTable } from "./organization-schema";
import { userTable } from "./user-schema";

export const memberTable = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["org-admin", "hr"] })
      .default("hr")
      .notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const memberRelations = relations(memberTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [memberTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [memberTable.userId],
    references: [userTable.id],
  }),
}));
