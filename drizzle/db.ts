import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Create a drizzle client with query
export const db = drizzle(pool, { schema });

// Create a normal drizzle client
// export const db = drizzle({ client: pool });
