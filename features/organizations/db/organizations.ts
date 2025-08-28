"use server"

import { db } from "@/drizzle/db";
import { organizationsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateOrgCache } from "./cache/organizations";

export async function insertOrg(org: typeof organizationsTable.$inferInsert) {
  const existingOrg = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, org.id));

  if (existingOrg.length === 0) {
    await db.insert(organizationsTable).values(org).onConflictDoNothing();
    revalidateOrgCache(org.id);
  }
}

export async function updateOrg(
  id: string,
  user: typeof organizationsTable.$inferInsert
) {
  await db
    .update(organizationsTable)
    .set(user)
    .where(eq(organizationsTable.id, id));
  revalidateOrgCache(id);
}

export async function deleteOrg(id: string) {
  await db.delete(organizationsTable).where(eq(organizationsTable.id, id));
  revalidateOrgCache(id);
}
