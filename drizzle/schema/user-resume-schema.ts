import { pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createdAt, updatedAt } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const userResumesTable = pgTable("user_resumes", {
  userId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  resumeFileUrl: text().notNull(),
  resumeFileKey: text().notNull(),
  aiSummary: text(),
  createdAt,
  updatedAt,
});

export const userResumesRelations = relations(userResumesTable, ({ one }) => ({
  user: one(user, {
    fields: [userResumesTable.userId],
    references: [user.id],
  }),
}));
