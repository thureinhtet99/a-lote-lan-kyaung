"use server";

import { db } from "@/lib/db";
import { organizationTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateOrgCache } from "./cache/organizations";

// Insert
export async function insertOrg(org: typeof organizationTable.$inferInsert) {
  const existingOrg = await db
    .select()
    .from(organizationTable)
    .where(eq(organizationTable.id, org.id));

  if (existingOrg.length === 0) {
    await db.insert(organizationTable).values(org).onConflictDoNothing();
    revalidateOrgCache(org.id);
  }
}

// Update
export async function updateOrg(
  id: string,
  user: typeof organizationTable.$inferInsert,
) {
  await db
    .update(organizationTable)
    .set(user)
    .where(eq(organizationTable.id, id));
  revalidateOrgCache(id);
}

// Delete
export async function deleteOrg(id: string) {
  await db.delete(organizationTable).where(eq(organizationTable.id, id));
  revalidateOrgCache(id);
}
