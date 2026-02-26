"use server";

import { db } from "@/lib/db";
import { applicationTable, jobListingTable } from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import z from "zod";
import { nanoid } from "nanoid";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";
import { jobListingFormSchema } from "../job-listing-schema";
import { nextJobListingStatus } from "../lib/utils";

// Get job listings with applications count
export const getJobListingWithApplications = async (
  orgId: string,
): Promise<{
  success: boolean;
  message?: string;
  data: {
    id: string;
    title: string;
    status: "draft" | "published" | "delisted";
    applications: number;
  }[];
}> => {
  try {
    return await getJobListingsWithApplicationsCached(orgId);
  } catch (error) {
    console.error("Error fetching job-listings with applications:", error);
    return {
      success: false,
      message: "Failed to fetch job-listings with applications",
      data: [],
    };
  }
};

const getJobListingsWithApplicationsCached = async (
  orgId: string,
): Promise<{
  success: boolean;
  message?: string;
  data: {
    id: string;
    title: string;
    status: "draft" | "published" | "delisted";
    applications: number;
  }[];
}> => {
  "use cache";
  cacheTag(`organizations-${orgId}-job-listings-applications`);
  cacheLife("days");

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

  return {
    success: true,
    message: "Job-listings with applications fetched successfully",
    data: result,
  };
};

export const getJobListingsByOrgId = async (
  orgId: string,
): Promise<{
  success: boolean;
  message?: string;
  data: (typeof jobListingTable.$inferSelect)[];
}> => {
  try {
    return await getJobListingsByOrgIdCached(orgId);
  } catch (error) {
    console.error("Error fetching job-listings by organization id :", error);
    return {
      success: false,
      message: "Failed to fetch job-listings by organization id",
      data: [],
    };
  }
};

const getJobListingsByOrgIdCached = async (
  orgId: string,
): Promise<{
  success: boolean;
  message?: string;
  data: (typeof jobListingTable.$inferSelect)[];
}> => {
  "use cache";
  cacheTag(`organizations-${orgId}-job-listings`);
  cacheLife("days");

  const result = await db.query.jobListingTable.findMany({
    where: eq(jobListingTable.organizationId, orgId),
  });

  return {
    success: true,
    message: "Job-listings by organization id fetched successfully",
    data: result,
  };
};

export const getJobListingByIdByOrgId = async (
  id: string,
  orgId: string,
): Promise<{
  success: boolean;
  message?: string;
  data?: typeof jobListingTable.$inferSelect;
}> => {
  try {
    const result = await db.query.jobListingTable.findFirst({
      where: and(
        eq(jobListingTable.id, id),
        eq(jobListingTable.organizationId, orgId),
      ),
    });
    return {
      success: true,
      message: "Job-listings by id by organization id fetched successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      "Error fetching job-listings by id by organization id :",
      error,
    );
    return {
      success: false,
      message: "Failed to fetch job-listings by id by organization id",
    };
  }
};

// Get most recent job listing
export const getMostRecentJobListing = async (orgId: string) => {
  const result = await db.query.jobListingTable.findFirst({
    where: eq(jobListingTable.organizationId, orgId),
    orderBy: desc(jobListingTable.created_at),
    columns: { id: true },
  });

  return result;
};

// Get by id
export const getJobListingById = async (jobListingId: string) => {
  const [result] = await db
    .select()
    .from(jobListingTable)
    .where(eq(jobListingTable.id, jobListingId));

  return result;
};

// Create
export const createJobListing = async (
  unsafeData: z.infer<typeof jobListingFormSchema>,
): Promise<{ success: boolean; message?: string; data?: { id: string } }> => {
  try {
    const { orgId } = await getCurrentOrg();
    if (orgId == null || !(await hasOrgUserPermission("job_listing.create")))
      return {
        success: false,
        message: "You don't have permission to create this job listing",
      };

    const { success, data } = jobListingFormSchema.safeParse(unsafeData);
    if (!success)
      return {
        success: false,
        message: "There was an error creating your job listing",
      };

    const [result] = await db
      .insert(jobListingTable)
      .values({
        id: nanoid(),
        ...data,
        organizationId: orgId,
        status: "draft",
      })
      .returning({
        id: jobListingTable.id,
      });

    updateTag(`organizations-${orgId}-job-listings`);
    updateTag(`organizations-${orgId}-job-listings-applications`);

    return {
      success: true,
      message: "Job-listing created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error creating job-listing:", error);
    return {
      success: false,
      message: "Failed to create job-listing",
    };
  }
};

// Update
export const updateJobListing = async (
  jobListingId: string,
  unsafeData: Partial<typeof jobListingTable.$inferInsert>,
): Promise<{ success: boolean; message?: string; data?: { id: string } }> => {
  try {
    const { orgId } = await getCurrentOrg();
    if (orgId == null || !(await hasOrgUserPermission("job_listing.update")))
      return {
        success: false,
        message: "You don't have permission to update this job listing",
      };

    const { success, data } = jobListingFormSchema.safeParse(unsafeData);
    if (!success)
      return {
        success: false,
        message: "There was an error updating your job listing data",
      };

    const jobListing = await getJobListingByIdByOrgId(jobListingId, orgId);
    if (!jobListing.data)
      return {
        success: false,
        message: "There was an error getting your job listing",
      };

    await db
      .update(jobListingTable)
      .set(data)
      .where(eq(jobListingTable.id, jobListingId));

    updateTag(`organizations-${orgId}-job-listings`);
    updateTag(`organizations-${orgId}-job-listings-applications`);

    return {
      success: true,
      message: "Job listing updated successfully",
    };
  } catch (error) {
    console.error("Error updating job-listing:", error);
    return {
      success: false,
      message: "Failed to update job-listing",
    };
  }
};

// Delete
export const deleteJobListing = async (
  id: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: false,
        message: "You don't have permission to delete this job listing",
      };

    const { data } = await getJobListingByIdByOrgId(id, orgId);
    if (data)
      return {
        success: false,
        message: "You don't have permission to delete this job listing",
      };

    if (!(await hasOrgUserPermission("job_listing.delete")))
      return {
        success: false,
        message: "You don't have permission to delete this job listing",
      };

    const [result] = await db
      .delete(jobListingTable)
      .where(eq(jobListingTable.id, id))
      .returning({
        id: jobListingTable.id,
        organizationId: jobListingTable.organizationId,
      });

    updateTag(`organizations-${orgId}-job-listings`);
    updateTag(`organizations-${orgId}-job-listings-applications`);

    return { success: true, message: "Job-listing deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete job-listing",
    };
  }
};

// Toggle status
export const toggleJobListingStatus = async (
  id: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: false,
        message:
          "You don't have permission to update this job listing's status",
      };

    const { data } = await getJobListingByIdByOrgId(id, orgId);
    if (!data)
      return {
        success: false,
        message:
          "You don't have permission to update this job listing's status",
      };

    const newStatus = nextJobListingStatus(data.status);
    if (
      !(await hasOrgUserPermission("job_listing.update"))
      // || (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))
    ) {
      return {
        success: false,
        message:
          "You don't have permission to update this job listing's status",
      };
    }

    await updateJobListing(id, {
      status: newStatus,
      isFeatured: newStatus === "published" ? undefined : false,
      posted_at:
        newStatus === "published" && data.posted_at == null
          ? new Date()
          : undefined,
    });

    const statusMessage =
      newStatus === "published"
        ? "Published successfully"
        : "Delisted successfully";

    return { success: true, message: statusMessage };
  } catch (error) {
    console.error("Error changing job-listing status:", error);
    return { success: true, message: "Failed to change job-listing status" };
  }
};

// Toggle featured status
export const toggleJobListingFeaturedStatus = async (
  id: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: false,
        message:
          "You don't have permission to update this job listing's featured status",
      };

    const { data } = await getJobListingByIdByOrgId(id, orgId);
    if (!data)
      return {
        success: false,
        message:
          "You don't have permission to update this job listing's featured status",
      };

    const newFeaturedStatus = !data.isFeatured;
    if (
      !(await hasOrgUserPermission("job_listing.update"))
      // ||(newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
    ) {
      return {
        success: false,
        message:
          "You don't have permission to update this job listing's featured status",
      };
    }

    await updateJobListing(id, {
      isFeatured: newFeaturedStatus,
    });

    const featuredMessage = newFeaturedStatus
      ? "Featured successfully"
      : "Unfeatured successfully";

    return { success: true, message: featuredMessage };
  } catch (error) {
    console.error("Error changing job-listing featured status:", error);
    return {
      success: true,
      message: "Failed to change job-listing featured status",
    };
  }
};

// Get published job listings count
export const getPublishedJobListingCount = async (
  orgId: string,
): Promise<{ success: boolean; message?: string; data?: number }> => {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(jobListingTable)
      .where(
        and(
          eq(jobListingTable.organizationId, orgId),
          eq(jobListingTable.status, "published"),
        ),
      );
    return {
      success: true,
      message: "Published job listing count fetched successfully",
      data: result?.count ?? 0,
    };
  } catch (error) {
    console.error("Error getting published job listing count:", error);
    return {
      success: true,
      message: "Failed to fetch published job listing count",
    };
  }
};
