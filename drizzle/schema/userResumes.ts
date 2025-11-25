import { pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
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

export const userResumesRelations = relations(userResumesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userResumesTable.userId],
    references: [usersTable.id],
  }),
}));
