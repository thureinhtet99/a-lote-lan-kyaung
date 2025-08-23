import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Create a regular drizzle client
export const db = drizzle(pool, { schema });

// export const db = drizzle(process.env.DATABASE_URL!);
