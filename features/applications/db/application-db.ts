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
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import {
  jobListingApplicationsTag,
  jobListingIdTag,
  resumeTag,
} from "@/lib/data-cache";
import { applicationFormSchema } from "../schema/application-form-schema";
import z from "zod";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { hasOrgUserPermission } from "@/lib/permissions";

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
  cacheTag(jobListingApplicationsTag(jobListingId));
  cacheLife("days");

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
  unsafeData: z.infer<typeof applicationFormSchema>,
) => {
  try {
    const { userId } = await getCurrentUser();
    if (userId == null)
      return {
        success: false,
        message: "You don't have permission to submit an application",
      };

    const { success: hasValidData, data } =
      applicationFormSchema.safeParse(unsafeData);
    if (!hasValidData)
      return {
        success: false,
        message: "There was an error submitting your application",
      };

    const existingApplication = await db.query.applicationTable.findFirst({
      where: and(
        eq(applicationTable.jobListingId, jobListingId),
        eq(applicationTable.userId, userId),
      ),
      columns: {
        jobListingId: true,
      },
    });
    if (existingApplication)
      return {
        success: false,
        message: "You have already applied for this job",
      };

    const jobListing = await db.query.jobListingTable.findFirst({
      where: and(
        eq(jobListingTable.id, jobListingId),
        eq(jobListingTable.status, "published"),
      ),
      columns: {
        id: true,
        organizationId: true,
      },
    });
    if (!jobListing)
      return {
        success: false,
        message: "Job listing is not available",
      };

    const [result] = await db
      .insert(applicationTable)
      .values({ jobListingId, userId, ...data })
      .returning({
        jobListingId: applicationTable.jobListingId,
        userId: applicationTable.userId,
      });

    // Save resume to user profile if requested and file key is provided
    if (data.saveToProfile && data.resumeFileKey) {
      await db
        .insert(resumeTable)
        .values({
          userId,
          resumeFileUrl: data.resumeFileUrl,
          resumeFileKey: data.resumeFileKey,
          resumeFileName:
            data.resumeFileName ??
            decodeURIComponent(
              data.resumeFileUrl.split("/").pop() ?? "resume.pdf",
            ),
        })
        .onConflictDoNothing();
      updateTag(resumeTag(userId));
    }

    updateTag(jobListingIdTag(jobListing.organizationId, result.jobListingId));
    revalidateTag(jobListingApplicationsTag(result.jobListingId), "max");

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
        success: false,
        message: "Invalid status",
      };

    if (!(await hasOrgUserPermission("application", ["update"])))
      return {
        success: false,
        message: "You don't have permission to update the status",
      };

    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: false,
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

    updateTag(jobListingApplicationsTag(result.jobListingId));

    return {
      success: true,
      message: "Application updated successfully",
    };
  } catch (error) {
    console.error("Error updating application: ", error);
    return {
      success: false,
      message: "Failed to update application",
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
        success: false,
        message: "Invalid status",
      };

    if (!(await hasOrgUserPermission("application", ["update"])))
      return {
        success: false,
        message: "You don't have permission to update the status",
      };

    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: false,
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

    updateTag(jobListingApplicationsTag(result.jobListingId));

    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating application status: ", error);
    return { success: false, message: "Failed to update status" };
  }
};

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
  cacheTag(resumeTag(userId));
  cacheLife("hours");

  const result = await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
    columns: {
      userId: true,
      resumeFileUrl: true,
      resumeFileKey: true,
      resumeFileName: true,
      updatedAt: true,
    },
  });

  if (!result?.userId)
    return {
      success: false,
      message: "User id is required",
    };

  return {
    success: true,
    message: "Resume get successfully",
    data: result,
  };
};

export const getResumeFileKey = async (userId: string) => {
  const data = await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
    columns: { resumeFileKey: true },
  });

  return data?.resumeFileKey;
};
