"use server";

import { db } from "@/lib/db";
import {
  applicationStatus,
  ApplicationStatusType,
  applicationTable,
  jobListingTable,
  resumeTable,
} from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { jobListingApplicationsTag, resumeTag } from "@/lib/utils/data-cache";
import { newJobListingApplicationSchema } from "../application-schema";
import z from "zod";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { getJobListingByIdByOrgId } from "@/features/job-listings/db/job-listing-db";
import { hasOrgUserPermission } from "@/lib/utils/permissions";

// Get application by userId
export const getApplicationByUserId = async ({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) => {
  try {
    return await getApplicationByUserIdCached({ jobListingId, userId });
  } catch (error) {
    console.error("Error fetching application by user: ", error);
    return {
      success: false,
      message: "Failed to fetch application by user",
    };
  }
};

const getApplicationByUserIdCached = async ({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) => {
  "use cache";

  const result = await db.query.applicationTable.findFirst({
    where: and(
      eq(applicationTable.jobListingId, jobListingId),
      eq(applicationTable.userId, userId),
    ),
  });

  if (!result)
    return {
      success: false,
      message: "Error fetching applications by user",
    };

  cacheTag(jobListingApplicationsTag(jobListingId));
  cacheLife("weeks");

  return {
    success: true,
    message: "Application by user fetched successfully",
    data: result,
  };
};

export const getApplicationsByJobListingId = async (jobListingId: string) => {
  try {
    return await getApplicationsByJobListingIdCached(jobListingId);
  } catch (error) {
    console.error(
      "Error fetching to fetch applications by job-listing: ",
      error,
    );
    return {
      success: false,
      message: "Failed to fetch applications by job-listing",
      data: [],
    };
  }
};

const getApplicationsByJobListingIdCached = async (jobListingId: string) => {
  "use cache";

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

  cacheTag(jobListingApplicationsTag(jobListingId));
  cacheLife("minutes");

  return {
    success: true,
    message: "Applications by job-listing fetched successfully",
    data: result,
  };
};

// Create
export const createApplication = async (
  jobListingId: string,
  unsafeData: z.infer<typeof newJobListingApplicationSchema>,
) => {
  try {
    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: true,
        message: "You don't have permission to submit an application",
      };

    const { userId } = await getCurrentUser();
    if (userId == null)
      return {
        error: true,
        message: "You don't have permission to submit an application",
      };

    const userResume = await getCachedUserResume(userId);
    const jobListing = await getJobListingByIdByOrgId(jobListingId, orgId);
    if (userResume == null || jobListing == null)
      return {
        success: true,
        message: "You don't have permission to submit an application",
      };

    const { success, data } =
      newJobListingApplicationSchema.safeParse(unsafeData);
    if (!success)
      return {
        error: true,
        message: "There was an error submitting your application",
      };

    const [result] = await db
      .insert(applicationTable)
      .values({ jobListingId, userId, ...data })
      .returning({
        jobListingId: applicationTable.jobListingId,
        userId: applicationTable.userId,
      });

    // updateTag(jobListingApplicationsTag(result.jobListingId));

    return {
      success: true,
      message: "Your application is submitted successfully",
    };
  } catch (error) {
    console.error("Error creating application: ", error);
    return {
      success: false,
      message: "Failed to submit application",
    };
  }
};

// Update
export async function updateApplication(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeStatus: ApplicationStatusType,
) {
  try {
    const { success, data: status } = z
      .enum(applicationStatus)
      .safeParse(unsafeStatus);
    if (!success)
      return {
        error: true,
        message: "Invalid status",
      };

    if (!(await hasOrgUserPermission("application", ["update"])))
      return {
        error: true,
        message: "You don't have permission to update the status",
      };

    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        error: true,
        message: "You don't have permission to update the status",
      };

    const [result] = await db
      .update(applicationTable)
      .set({ status })
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

    // updateTag(jobListingApplicationsTag(result.jobListingId));

    return {
      success: true,
      message: "Application updated successfully",
    };
  } catch (error) {
    console.error("Error updating application: ", error);
    return {
      success: false,
      message: "Failed to create successfully",
    };
  }
}

export const updateApplicationStatus = async (
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeStatus: ApplicationStatusType,
) => {
  try {
    const { success, data: safeStatus } = z
      .enum(applicationStatus)
      .safeParse(unsafeStatus);
    if (!success)
      return {
        error: true,
        message: "Invalid status",
      };

    if (!(await hasOrgUserPermission("application", ["update"])))
      return {
        error: true,
        message: "You don't have permission to update the status",
      };

    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        error: true,
        message: "You don't have permission to update the status",
      };

    const [result] = await db
      .update(applicationTable)
      .set({ status: safeStatus ?? null })
      .where(
        and(
          eq(applicationTable.jobListingId, jobListingId),
          eq(applicationTable.userId, userId),
        ),
      )
      .returning({
        jobListingId: applicationTable.jobListingId,
      });

    // updateTag(jobListingApplicationsTag(result.jobListingId));

    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating application status: ", error);
    return { success: false, message: "Failed to update status" };
  }
};

export async function updateApplicationRating(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  rating: number | null,
) {
  try {
    const { success, data: safeRating } = z
      .number()
      .min(1)
      .max(5)
      .nullish()
      .safeParse(rating);
    if (!success) return { error: true, message: "Invalid rating" };

    if (!(await hasOrgUserPermission("application", ["update"])))
      return {
        error: true,
        message: "You don't have permission to update the rating",
      };

    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        error: true,
        message: "You don't have permission to update the rating",
      };

    const [result] = await db
      .update(applicationTable)
      .set({ rating: safeRating ?? null })
      .where(
        and(
          eq(applicationTable.jobListingId, jobListingId),
          eq(applicationTable.userId, userId),
        ),
      )
      .returning({
        jobListingId: applicationTable.jobListingId,
      });

    // updateTag(jobListingApplicationsTag(result.jobListingId));

    return { success: true, message: "Rating updated successfully" };
  } catch (error) {
    console.error("Error updating application rating: ", error);
    return { success: false, message: "Failed to update rating" };
  }
}

export const getResume = async (userId: string) => {
  try {
    return await getCachedUserResume(userId);
  } catch (error) {
    console.error("Error fetching resume: ", error);
    return {
      success: false,
      message: "Failed to get resume",
    };
  }
};

const getCachedUserResume = async (userId: string) => {
  "use cache";

  const result = await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
    columns: { userId: true },
  });

  if (!result?.userId)
    return {
      success: false,
      message: "User id is required",
    };

  cacheTag(resumeTag(userId));
  cacheLife("hours");

  return {
    success: true,
    message: "Resume get successfully",
    data: result,
  };
};
