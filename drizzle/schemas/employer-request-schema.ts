import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userTable } from "./user-schema";

export const employerRequestTable = pgTable(
  "employer_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
    requestMessage: text("request_message").notNull(),
    adminResponse: text("admin_response"),
    reviewedBy: text("reviewed_by").references(() => userTable.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("employer_request_userId_idx").on(table.userId),
    index("employer_request_status_idx").on(table.status),
  ],
);

export const employerRequestRelations = relations(
  employerRequestTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [employerRequestTable.userId],
      references: [userTable.id],
    }),
    reviewer: one(userTable, {
      fields: [employerRequestTable.reviewedBy],
      references: [userTable.id],
    }),
  }),
);
