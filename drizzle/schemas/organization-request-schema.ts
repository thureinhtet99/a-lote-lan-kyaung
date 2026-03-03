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
import { organizationTable } from "./organization-schema";

export const organizationRequestTable = pgTable(
  "organization_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    orgName: text("org_name").notNull(),
    orgSlug: text("org_slug").notNull(),
    orgLogo: text("org_logo"),
    requestMessage: text("request_message").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
    adminResponse: text("admin_response"),
    reviewedBy: text("reviewed_by").references(() => userTable.id),
    reviewedAt: timestamp("reviewed_at"),
    createdOrganizationId: text("created_organization_id").references(
      () => organizationTable.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("org_request_userId_idx").on(table.userId),
    index("org_request_status_idx").on(table.status),
  ],
);

export const organizationRequestRelations = relations(
  organizationRequestTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [organizationRequestTable.userId],
      references: [userTable.id],
    }),
    reviewer: one(userTable, {
      fields: [organizationRequestTable.reviewedBy],
      references: [userTable.id],
    }),
    createdOrganization: one(organizationTable, {
      fields: [organizationRequestTable.createdOrganizationId],
      references: [organizationTable.id],
    }),
  }),
);
