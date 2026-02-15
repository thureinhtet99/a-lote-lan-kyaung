import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  ClipboardListIcon,
  LogInIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { ReactNode, Suspense } from "react";
import Link from "next/link";
import AppSidebar from "@/components/layout/sidebar/app-sidebar";
import SidebarNavMenuGroup from "@/components/layout/sidebar/sidebar-nav-menu";
import { APP_ROUTES } from "@/config/app-config";
import { unstable_cache } from "next/cache";
import { sortJobListingsByStatus } from "@/features/job-listings/lib/utils";
import { JobListingStatusType } from "@/drizzle/schema";
import JobListingMenuGroup from "@/components/features/organizations/_job-listing-menu-group";
import { jobListingsTag } from "@/lib/utils/dataCache";
import Loading from "@/components/shared/loading";
import { getJobListingWithApplicationsDb } from "@/features/applications/db/job-listing-application-db";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import SidebarOrgButton from "@/components/features/organizations/sidebar-org-button";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent>{children}</SuspendedComponent>
    </Suspense>
  );
}

const SuspendedComponent = async ({ children }: { children: ReactNode }) => {
  const { orgId } = await getCurrentOrg();
  
  // If no organization, render children without sidebar (for organizations selection page)
  if (orgId == null) {
    return <main className="w-full">{children}</main>;
  }

  // Get all job listings with applications(cached)
  const cachedData = unstable_cache(
    async () => await getJobListingWithApplicationsDb(orgId),
    [orgId],
    {
      tags: [jobListingsTag(orgId, "jobListings")],
    },
  );

  const jobListings = await cachedData();
  const canCreateJobListing = await hasOrgUserPermission("job_listing.create");

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel className="mb-4">
              <Link
                href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`}
                className="w-full flex items-center justify-between"
              >
                Create job listings here
              </Link>
            </SidebarGroupLabel>

            {jobListings.length > 0 && canCreateJobListing && (
              <SidebarGroupAction title="Add job listing" asChild>
                <Link href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`}>
                  <PlusIcon />
                  <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            )}
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense fallback={<Loading />}>
                <JobListingMenu jobListings={jobListings} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: APP_ROUTES.EMPLOYER.SETTINGS.HOME,
                icon: <SettingsIcon />,
                label: "Organization Settings",
              },
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
        b as JobListingStatusType,
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
