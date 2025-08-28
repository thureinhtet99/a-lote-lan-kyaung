"use server";

import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/jobListings";

// Create
export async function insertJobListing(
  job: typeof jobListingsTable.$inferInsert
) {
  const [result] = await db.insert(jobListingsTable).values(job).returning({
    id: jobListingsTable.id,
    organizationId: jobListingsTable.organizationId,
  });
  
  revalidateJobListingCache(result);

  return result;
}

// Update
export async function updateJobListing(
  id: string,
  job: typeof jobListingsTable.$inferInsert
) {
  const [result] = await db
    .update(jobListingsTable)
    .set(job)
    .where(eq(jobListingsTable.id, id))
    .returning({
      id: jobListingsTable.id,
      organizationId: jobListingsTable.organizationId,
    });
  revalidateJobListingCache(result);
}

// Delete
// export async function deleteJobListing(id: string) {
//   await db.delete(jobListingsTable).where(eq(jobListingsTable.id, id));
//   revalidateJobListingCache(job.id);
// }
