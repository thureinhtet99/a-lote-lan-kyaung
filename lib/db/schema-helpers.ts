import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();

export const created_at = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow();
export const updated_at = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());
