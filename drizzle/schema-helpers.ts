import { text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const id = text("id")
  .primaryKey()
  .$defaultFn(() => nanoid());
export const created_at = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow();
export const updated_at = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());
