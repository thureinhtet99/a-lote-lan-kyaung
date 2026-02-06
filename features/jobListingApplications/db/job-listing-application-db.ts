"use server";

import { db } from "@/drizzle/db";
import { applicationTable, jobListingTable } from "@/drizzle/schema";
import { revalidateJobListingApplicationCache } from "./cache/jobListingApplications";
import { and, count, desc, eq } from "drizzle-orm";

// Create
export async function insertJobListingApplicationDb(
  data: typeof applicationTable.$inferInsert,
) {
  const [result] = await db.insert(applicationTable).values(data).returning({
    jobListingId: applicationTable.jobListingId,
    userId: applicationTable.userId,
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
  data: Partial<typeof applicationTable.$inferInsert>,
) {
  const [result] = await db
    .update(applicationTable)
    .set(data)
    .where(
      and(
        eq(applicationTable.jobListingId, jobListingId),
        eq(applicationTable.userId, userId),
      ),
    )
    .returning({
      jobListingId: applicationTable.jobListingId,
      userId: applicationTable.userId,
    });

  revalidateJobListingApplicationCache({
    jobListingId: result.jobListingId,
    userId: result.userId,
  });

  return result;
}

// Get applications by job listing id db
export const getJobListingApplicationsDb = async (jobListingId: string) => {
  const result = await db.query.applicationTable.findMany({
    where: eq(applicationTable.jobListingId, jobListingId),
    columns: {
      jobListingId: true,
      coverLetter: true,
      rating: true,
      status: true,
      created_at: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              // aiSummary: true,
            },
          },
        },
      },
    },
  });

  return result;
};

// Get all job listings with applications count
export const getJobListingWithApplicationsDb = async (orgId: string) => {
  const result = await db
    .select({
      id: jobListingTable.id,
      title: jobListingTable.title,
      status: jobListingTable.status,
      applications: count(applicationTable.userId),
    })
    .from(jobListingTable)
    .where(eq(jobListingTable.organizationId, orgId))
    .leftJoin(
      applicationTable,
      eq(jobListingTable.id, applicationTable.jobListingId),
    )
    .groupBy(applicationTable.jobListingId, jobListingTable.id)
    .orderBy(desc(jobListingTable.created_at));

  return result;
};
