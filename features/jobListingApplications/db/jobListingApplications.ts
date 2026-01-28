"use server";

import { db } from "@/drizzle/db";
import { jobListingApplicationsTable } from "@/drizzle/schema";
import { revalidateJobListingApplicationCache } from "./cache/jobListingApplications";
import { and, eq } from "drizzle-orm";

// Create
export async function insertJobListingApplicationDb(
  data: typeof jobListingApplicationsTable.$inferInsert
) {
  const [result] = await db
    .insert(jobListingApplicationsTable)
    .values(data)
    .returning({
      jobListingId: jobListingApplicationsTable.jobListingId,
      userId: jobListingApplicationsTable.userId,
    });
  revalidateJobListingApplicationCache({
    jobListingId: result.jobListingId,
    userId: result.userId,
  });

  return result;
}

// Update
export async function updateJobListingApplicationDb(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  data: Partial<typeof jobListingApplicationsTable.$inferInsert>
) {
  const [result] = await db
    .update(jobListingApplicationsTable)
    .set(data)
    .where(
      and(
        eq(jobListingApplicationsTable.jobListingId, jobListingId),
        eq(jobListingApplicationsTable.userId, userId)
      )
    )
    .returning({
      jobListingId: jobListingApplicationsTable.jobListingId,
      userId: jobListingApplicationsTable.userId,
    });

  revalidateJobListingApplicationCache({
    jobListingId: result.jobListingId,
    userId: result.userId,
  });

  return result;
}
