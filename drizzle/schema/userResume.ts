import {  pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const userResumesTable = pgTable("user_resumes", {
  userId: varchar()
    .primaryKey()
    .references(() => usersTable.id),
  resumeFileUrl: varchar().notNull(),
  resumeFileKey: varchar().notNull(),
  aiSummary: varchar(),
  createdAt,
  updatedAt,
});

export const userResumeRelations = relations(
  userResumesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userResumesTable.userId],
      references: [usersTable.id],
    }),
  })
);
