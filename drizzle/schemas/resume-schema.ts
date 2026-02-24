import { pgTable, text } from "drizzle-orm/pg-core";
import { userTable } from "./auth-schema";
import { created_at, updated_at } from "../schema-helpers";
import { relations } from "drizzle-orm";

export const resumeTable = pgTable("resumes", {
  userId: text("user_id")
    .primaryKey()
    .references(() => userTable.id, { onDelete: "cascade" }),
  resumeFileUrl: text("resume_file_url").notNull(),
  resumeFileKey: text("resume_file_key").notNull(),
  // aiSummary: text("ai_summary"),
  created_at,
  updated_at,
});

export const userResumesRelations = relations(resumeTable, ({ one }) => ({
  user: one(userTable, {
    fields: [resumeTable.userId],
    references: [userTable.id],
  }),
}));
