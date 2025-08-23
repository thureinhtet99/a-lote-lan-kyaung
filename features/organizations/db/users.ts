import { db } from "@/drizzle/db";
import { organizationsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateOrgCache } from "./cache/organizations";

export async function insertOrg(org: typeof organizationsTable.$inferInsert) {
  await db.insert(organizationsTable).values(org).onConflictDoNothing();
  revalidateOrgCache(org.id);
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

export async function deleteUser(id: string) {
  await db.delete(organizationsTable).where(eq(organizationsTable.id, id));
  revalidateOrgCache(id);
}
