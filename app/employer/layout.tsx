import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ClipboardListIcon, LogInIcon, PlusIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import Link from "next/link";
import AppSidebar from "@/components/sidebar/AppSidebar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import SidebarOrgButton from "@/features/organizations/components/SidebarOrgButton";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { APP_ROUTES } from "@/config/appConfig";
import CheckCondition from "@/components/CheckCondition";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import OrganizationSyncWrapper from "@/services/clerk/component/OrganizationSyncWrapper";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { sortJobListingsByStatus } from "@/features/jobListings/lib/utils";
import {
  jobListingApplicationsTable,
  jobListingsTable,
  JobListingStatusType,
} from "@/drizzle/schema";
import JobListingMenuGroup from "./_JobListingMenuGroup";
import {
  jobListingApplicationGlobalTag,
  jobListingGlobalTag,
} from "@/lib/dataCache";
import LoadingSpinner from "@/components/LoadingSpinner";
import { db } from "@/drizzle/db";
import { count, desc, eq } from "drizzle-orm";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OrganizationSyncWrapper>
        {/* <OrgDatabaseSync /> */}
        <Suspense fallback={<LoadingSpinner />}>
          <SuspendedComponent>{children}</SuspendedComponent>
        </Suspense>
      </OrganizationSyncWrapper>
    </>
  );
}

const SuspendedComponent = async ({ children }: { children: ReactNode }) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.ORG.SELECT);

  // Get all job listings (cached)
  const cachedData = unstable_cache(
    async () => await getJobListingsWithApplicationsDb(orgId),
    [orgId],
    {
      tags: [jobListingApplicationGlobalTag(orgId, "jobListings")],
    }
  );

  const jobListings = await cachedData();

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job listings</SidebarGroupLabel>
            {jobListings.length > 0 && (
              <CheckCondition
                condition={() => hasOrgUserPermission("job_listing:create")}
              >
                <SidebarGroupAction title="Add job listing" asChild>
                  <Link href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`}>
                    <PlusIcon />
                    <span className="sr-only">Add Job Listing</span>
                  </Link>
                </SidebarGroupAction>
              </CheckCondition>
            )}
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingMenu jobListings={jobListings} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: APP_ROUTES.HOME,
                icon: <ClipboardListIcon />,
                label: "Job board",
              },
              {
                href: APP_ROUTES.SIGN_IN,
                icon: <LogInIcon />,
                label: "Sign In",
                authStatus: "signedOut",
              },
            ]}
          />
        </>
      }
      footerButton={<SidebarOrgButton />}
    >
      {children}
    </AppSidebar>
  );
};

const JobListingMenu = async ({
  jobListings,
}: {
  jobListings: {
    id: string;
    title: string;
    status: "draft" | "published" | "delisted";
    applications: number;
  }[];
}) => {
  return Object.entries(Object.groupBy(jobListings, (obj) => obj.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatusType,
        b as JobListingStatusType
      );
    })
    .map(([status, jobListings]) => (
      <JobListingMenuGroup
        key={status}
        status={status as JobListingStatusType}
        jobListings={jobListings}
      />
    ));
};

// Get all job listings
const getJobListingsWithApplicationsDb = async (orgId: string) => {
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
      eq(jobListingsTable.id, jobListingApplicationsTable.jobListingId)
    )
    .groupBy(jobListingApplicationsTable.jobListingId, jobListingsTable.id)
    .orderBy(desc(jobListingsTable.createdAt));

  return result;
};
