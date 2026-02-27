"use server";

import { db } from "@/lib/db";
import { applicationTable, jobListingTable } from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import {
  jobListingApplicationsTag,
} from "@/lib/utils/data-cache";

export const getApplicationsByJobListingId = async (jobListingId: string) => {
  try {
    return await getApplicationsByJobListingIdCached(jobListingId);
  } catch (error) {
    return {
      success: false,
      message: "Error fetching applications by job-listing id",
      data: [],
    };
  }
};

const getApplicationsByJobListingIdCached = async (jobListingId: string) => {
  "use cache";
  cacheTag(jobListingApplicationsTag(jobListingId, "all"));
  cacheLife("minutes");

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

  return {
    success: true,
    message: "Applications by job-listing id fetched successfully",
    data: result,
  };
};

// Create
export async function insertJobListingApplicationDb(
  data: typeof applicationTable.$inferInsert,
) {
  const [result] = await db.insert(applicationTable).values(data).returning({
    jobListingId: applicationTable.jobListingId,
    userId: applicationTable.userId,
  });
  updateTag(jobListingApplicationsTag(result.jobListingId, "all"));
  updateTag(jobListingApplicationsTag(result.jobListingId, result.userId));

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

  updateTag(jobListingApplicationsTag(result.jobListingId, "all"));
  updateTag(jobListingApplicationsTag(result.jobListingId, result.userId));

  return result;
}
