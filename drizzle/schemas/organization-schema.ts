import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { memberTable } from "./member-schema";
import { invitationTable } from "./invitation-schema";

export const organizationTable = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const organizationRelations = relations(
  organizationTable,
  ({ many }) => ({
    members: many(memberTable),
    invitations: many(invitationTable),
  }),
);
