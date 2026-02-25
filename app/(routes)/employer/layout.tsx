import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Building2Icon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogInIcon,
  PlusIcon,
} from "lucide-react";
import { ReactNode, Suspense } from "react";
import Link from "next/link";
import AppSidebar from "@/components/layout/sidebar/app-sidebar";
import SidebarNavMenuGroup from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import { sortJobListingsByStatus } from "@/features/job-listings/lib/utils";
import { JobListingStatusType } from "@/drizzle/schema";
import JobListingMenuGroup from "@/components/organizations/_job-listing-menu-group";
import Loading from "@/components/shared/loading";
import { getJobListingWithApplicationsDb } from "@/features/applications/db/job-listing-application-db";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import SidebarOrgButton from "@/components/organizations/sidebar-org-button";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";
import { cacheTag, cacheLife } from "next/cache";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent>{children}</SuspendedComponent>
    </Suspense>
  );
}

async function getCachedJobListingsWithApplications(orgId: string) {
  "use cache";
  cacheTag("job-listings-applications-" + orgId);
  cacheLife("minutes");

  return await getJobListingWithApplicationsDb(orgId);
}

const SuspendedComponent = async ({ children }: { children: ReactNode }) => {
  const { orgId } = await getCurrentOrg();

  // If no organization, keep employer navigation visible for organization selection flow.
  if (orgId == null) {
    return (
      <AppSidebar
        content={
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: APP_ROUTES.HOME,
                icon: <ClipboardListIcon />,
                label: "Job board",
              },
              {
                href: APP_ROUTES.EMPLOYER.ORG,
                icon: <Building2Icon />,
                label: "Organizations",
              },
              {
                href: APP_ROUTES.SIGN_IN,
                icon: <LogInIcon />,
                label: "Sign In",
                authStatus: "signedOut",
              },
            ]}
          />
        }
        footerButton={<SidebarOrgButton />}
      >
        {children}
      </AppSidebar>
    );
  }

  // Get all job listings with applications(cached)
  const jobListings = await getCachedJobListingsWithApplications(orgId);
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
                href: APP_ROUTES.HOME,
                icon: <ClipboardListIcon />,
                label: "Job board",
              },
              {
                href: APP_ROUTES.EMPLOYER.HOME,
                icon: <LayoutDashboardIcon />,
                label: "Employer dashboard",
                activePathPrefixes: [APP_ROUTES.EMPLOYER.JOB_LISTINGS],
                authStatus: "signedIn",
                roles: ["employer"],
              },
              {
                href: APP_ROUTES.EMPLOYER.ORG,
                icon: <Building2Icon />,
                label: "Organizations",
                authStatus: "signedIn",
                roles: ["employer"],
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
