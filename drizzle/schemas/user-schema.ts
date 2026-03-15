import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sessionTable } from "./session-schema";
import { accountTable } from "./account-schema";
import { memberTable } from "./member-schema";
import { invitationTable } from "./invitation-schema";
import { resumeTable } from "./resume-schema";
import { employerRequestTable } from "./employer-request-schema";
import { organizationRequestTable } from "./organization-request-schema";
import { created_at, updated_at } from "../schema-helpers";

export const userTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role", { enum: ["user", "employer", "admin"] })
    .default("user")
    .notNull(),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  createdAt: created_at,
  updatedAt: updated_at,
});

export const userRelations = relations(userTable, ({ one, many }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  members: many(memberTable),
  invitations: many(invitationTable),
  resume: one(resumeTable),
  employerRequests: many(employerRequestTable),
  organizationRequests: many(organizationRequestTable),
}));
