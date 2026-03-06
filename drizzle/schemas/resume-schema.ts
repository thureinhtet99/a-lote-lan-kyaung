import { pgTable, text } from "drizzle-orm/pg-core";
import { created_at, updated_at } from "../schema-helpers";
import { relations } from "drizzle-orm";
import { userTable } from "./user-schema";

export const resumeTable = pgTable("resumes", {
  userId: text("user_id")
    .primaryKey()
    .references(() => userTable.id, { onDelete: "cascade" }),
  resumeFileUrl: text("file_url").notNull(),
  resumeFileKey: text("file_key").notNull(),
  resumeFileName: text("file_name"),
  created_at,
  updated_at,
});

export const userResumesRelations = relations(resumeTable, ({ one }) => ({
  user: one(userTable, {
    fields: [resumeTable.userId],
    references: [userTable.id],
  }),
}));
