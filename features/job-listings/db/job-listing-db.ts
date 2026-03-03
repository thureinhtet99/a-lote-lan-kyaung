"use server";

import { db } from "@/lib/db";
import { applicationTable, jobListingTable } from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import z from "zod";
import { nanoid } from "nanoid";
import { getCurrentOrg, safeGetSession } from "@/lib/auth/auth-helpers";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/permissions";
import {
  jobListingIdTag,
  jobListingsTag,
  mostRecentJobListingIdTag,
  sideBarJobListingWithApplicationsTag,
} from "@/lib/data-cache";
import { jobListingFormSchema } from "../schema/job-listing-form-schema";
import { nextJobListingStatus } from "../lib/utils";

// export const getJobListingById = async (id: string) => {
//   return await db.query.jobListingTable.findFirst({
//     where: and(
//       eq(jobListingTable.id, id),
//       eq(jobListingTable.status, "published"),
//     ),
//     columns: { id: true },
//   });
// };

// Get job listings with applications count
export const getJobListingWithApplications = async (orgId: string) => {
  try {
    const session = await safeGetSession();
    if (!session?.user)
      return { success: false, message: "Unauthorized", data: [] };

    const userId = session.user.id;

    return await getJobListingsWithApplicationsCached(orgId, userId);
  } catch (error) {
    console.error("Error fetching job-listings with applications: ", error);
    return {
      success: false,
      message: "Failed to fetch job-listings with applications",
      data: [],
    };
  }
};

const getJobListingsWithApplicationsCached = async (
  orgId: string,
  userId: string,
) => {
  "use cache";

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

  cacheTag(sideBarJobListingWithApplicationsTag(orgId, userId));
  cacheLife("days");

  return {
    success: true,
    message: "Job-listings with applications fetched successfully",
    data: result,
  };
};

export const getJobListingsByOrgId = async (orgId: string) => {
  try {
    return await getJobListingsByOrgIdCached(orgId);
  } catch (error) {
    console.error("Error fetching job-listings by organization: ", error);
    return {
      success: false,
      message: "Failed to fetch job-listings by organization",
      data: [],
    };
  }
};

const getJobListingsByOrgIdCached = async (orgId: string) => {
  "use cache";

  const result = await db.query.jobListingTable.findMany({
    where: eq(jobListingTable.organizationId, orgId),
  });

  cacheTag(jobListingsTag(orgId));
  cacheLife("days");

  return {
    success: true,
    message: "Job-listings by organization id fetched successfully",
    data: result,
  };
};

export const getJobListingByIdByOrgId = async (id: string, orgId: string) => {
  try {
    return await getJobListingByIdByOrgIdCached(id, orgId);
  } catch (error) {
    console.error("Error fetching job-listing by organization: ", error);
    return {
      success: false,
      message: "Failed to fetch job-listings by organization",
    };
  }
};

const getJobListingByIdByOrgIdCached = async (id: string, orgId: string) => {
  "use cache";
  const result = await db.query.jobListingTable.findFirst({
    where: and(
      eq(jobListingTable.id, id),
      eq(jobListingTable.organizationId, orgId),
    ),
  });
  if (!result)
    return {
      success: true,
      message: "Job-listings by organization fetched successfully",
    };

  cacheTag(jobListingIdTag(orgId, id));
  cacheLife("days");

  return {
    success: true,
    message: "Job-listing by organization fetched successfully",
    data: result,
  };
};

// Get most recent job listing
export const getMostRecentJobListing = async (orgId: string) => {
  try {
    return await getMostRecentJobListingCached(orgId);
  } catch (error) {
    console.error("Failed to get most recent job-listings: ", error);
    return {
      success: false,
      message: "Failed to get most recent job-listing",
      data: null,
    };
  }
};

const getMostRecentJobListingCached = async (orgId: string) => {
  "use cache";

  const [result] = await db
    .select({ id: jobListingTable.id })
    .from(jobListingTable)
    .where(eq(jobListingTable.organizationId, orgId))
    .orderBy(desc(jobListingTable.created_at))
    .limit(1);

  if (!result) {
    return {
      success: true,
      message: "No job listings found",
      data: null,
    };
  }

  cacheTag(mostRecentJobListingIdTag(orgId, result.id));
  cacheLife("hours");

  return {
    success: true,
    message: "Most recent job-listings fetched successfully",
    data: result,
  };
};

// Get by id
export const getPublishedJobListingByIdWithOrganization = async (
  jobListingId: string,
) => {
  try {
    return await getPublishedJobListingByIdWithOrganizationCached(jobListingId);
  } catch (error) {
    console.error(
      "Error fetching  published job-listing by organization: ",
      error,
    );
    return {
      success: false,
      message: "Failed to fetch published job-listing by organization",
    };
  }
};

const getPublishedJobListingByIdWithOrganizationCached = async (
  jobListingId: string,
) => {
  "use cache";
  const result = await db.query.jobListingTable.findFirst({
    where: and(
      eq(jobListingTable.id, jobListingId),
      eq(jobListingTable.status, "published"),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  });

  if (!result) return { success: false, message: "Job-listing not found" };
  if (!result.organization)
    return {
      success: false,
      message: "Organization not found for this job-listing",
    };

  cacheTag(jobListingIdTag(result.organization.id, result.id));
  cacheLife("max");

  return {
    success: true,
    message: "Job-listing by id fetched successfully",
    data: result,
  };
};

// Create
export const createJobListing = async (
  unsafeData: z.infer<typeof jobListingFormSchema>,
) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) return { success: false, message: "Unauthorized" };

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

    updateTag(jobListingIdTag(orgId, result.id));
    updateTag(jobListingsTag(orgId));
    updateTag(sideBarJobListingWithApplicationsTag(orgId, session.user.id));

    return {
      success: true,
      message: "Job-listing created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error creating job-listing: ", error);
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
    const session = await safeGetSession();

    if (!session?.user) return { success: false, message: "Unauthorized" };

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

    updateTag(jobListingIdTag(orgId, jobListingId));
    updateTag(jobListingsTag(orgId));
    updateTag(sideBarJobListingWithApplicationsTag(orgId, session.user.id));

    return {
      success: true,
      message: "Job listing updated successfully",
    };
  } catch (error) {
    console.error("Error updating job-listing: ", error);
    return {
      success: false,
      message: "Failed to update job-listing",
    };
  }
};

// Delete
export const deleteJobListing = async (id: string) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) return { success: false, message: "Unauthorized" };

    const { orgId } = await getCurrentOrg();
    if (orgId == null)
      return {
        success: false,
        message: "You don't have permission to delete this job listing",
      };

    const jobListing = await getJobListingByIdByOrgId(id, orgId);
    if (!jobListing.data)
      return {
        success: false,
        message: "Job-listing is not found",
      };

    if (!(await hasOrgUserPermission("job_listing.delete")))
      return {
        success: false,
        message: "You don't have permission to delete this job listing",
      };

    await db.delete(jobListingTable).where(eq(jobListingTable.id, id));

    updateTag(jobListingIdTag(orgId, id));
    updateTag(jobListingsTag(orgId));
    updateTag(sideBarJobListingWithApplicationsTag(orgId, session.user.id));

    return {
      success: true,
      message: "Job-listing deleted successfully",
      deleted: true,
    };
  } catch (error) {
    console.error("Error deleting job-listing:", error);
    return {
      success: false,
      message: "Failed to delete job-listing",
    };
  }
};

// Toggle status
export const toggleJobListingStatus = async (id: string) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) return { success: false, message: "Unauthorized" };

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

    await db
      .update(jobListingTable)
      .set({
        status: newStatus,
        isFeatured: newStatus === "published" ? data.isFeatured : false,
        posted_at:
          newStatus === "published" && data.posted_at == null
            ? new Date()
            : data.posted_at,
      })
      .where(eq(jobListingTable.id, id));

    updateTag(jobListingIdTag(orgId, id));
    updateTag(jobListingsTag(orgId));
    updateTag(sideBarJobListingWithApplicationsTag(orgId, session.user.id));

    const statusMessage =
      newStatus === "published"
        ? "Published successfully"
        : "Delisted successfully";

    return { success: true, message: statusMessage };
  } catch (error) {
    console.error("Error changing job-listing status:", error);
    return { success: false, message: "Failed to change job-listing status" };
  }
};

// Toggle featured status
export const toggleJobListingFeaturedStatus = async (id: string) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) return { success: false, message: "Unauthorized" };

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

    await db
      .update(jobListingTable)
      .set({
        isFeatured: newFeaturedStatus,
      })
      .where(eq(jobListingTable.id, id));

    updateTag(jobListingIdTag(orgId, id));
    updateTag(jobListingsTag(orgId));
    updateTag(sideBarJobListingWithApplicationsTag(orgId, session.user.id));

    const featuredMessage = newFeaturedStatus
      ? "Featured successfully"
      : "Unfeatured successfully";

    return { success: true, message: featuredMessage };
  } catch (error) {
    console.error("Error changing job-listing featured status:", error);
    return {
      success: false,
      message: "Failed to change job-listing featured status",
    };
  }
};

// Get published job listings count
export const getPublishedJobListingCount = async (orgId: string) => {
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
      data: result.count,
    };
  } catch (error) {
    console.error("Error getting published job listing count: ", error);
    return {
      success: false,
      message: "Failed to fetch published job listing count",
    };
  }
};
