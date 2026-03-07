import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { userTable } from "./user-schema";
import { created_at, updated_at } from "../schema-helpers";

export const verificationTable = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: created_at,
    updatedAt: updated_at,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
