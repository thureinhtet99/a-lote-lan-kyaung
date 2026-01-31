"use server";

import { db } from "@/drizzle/db";
import {
  jobListingApplicationsTable,
  jobListingsTable,
} from "@/drizzle/schema";
import { revalidateJobListingApplicationCache } from "./cache/jobListingApplications";
import { and, count, desc, eq } from "drizzle-orm";

// Create
export async function insertJobListingApplicationDb(
  data: typeof jobListingApplicationsTable.$inferInsert,
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
  data: Partial<typeof jobListingApplicationsTable.$inferInsert>,
) {
  const [result] = await db
    .update(jobListingApplicationsTable)
    .set(data)
    .where(
      and(
        eq(jobListingApplicationsTable.jobListingId, jobListingId),
        eq(jobListingApplicationsTable.userId, userId),
      ),
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

// Get applications by job listing id db
export const getJobListingApplicationsDb = async (jobListingId: string) => {
  const result = await db.query.jobListingApplicationsTable.findMany({
    where: eq(jobListingApplicationsTable.jobListingId, jobListingId),
    columns: {
      jobListingId: true,
      coverLetter: true,
      rating: true,
      status: true,
      createdAt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          first_name: true,
          last_name: true,
          image: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              aiSummary: true,
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
      id: jobListingsTable.id,
      title: jobListingsTable.title,
      status: jobListingsTable.status,
      applications: count(jobListingApplicationsTable.userId),
    })
    .from(jobListingsTable)
    .where(eq(jobListingsTable.organizationId, orgId))
    .leftJoin(
      jobListingApplicationsTable,
      eq(jobListingsTable.id, jobListingApplicationsTable.jobListingId),
    )
    .groupBy(jobListingApplicationsTable.jobListingId, jobListingsTable.id)
    .orderBy(desc(jobListingsTable.createdAt));

  return result;
};
