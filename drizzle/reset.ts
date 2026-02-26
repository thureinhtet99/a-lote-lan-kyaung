import "dotenv/config";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function resetDatabase() {
  console.log("Dropping schema...");

  await db.execute(sql`DROP SCHEMA public CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);

  console.log("Database reset complete.");
}

resetDatabase();
