import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ClipboardListIcon, LogInIcon, PlusIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import Link from "next/link";
import AppSidebar from "@/components/sidebar/app-sidebar";
import SidebarNavMenuGroup from "@/components/sidebar/sidebar-nav-menu";
import SidebarOrgButton from "@/features/organizations/components/sidebar-org-button";
import { APP_ROUTES } from "@/config/appConfig";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { sortJobListingsByStatus } from "@/features/jobListings/lib/utils";
import { JobListingStatusType } from "@/drizzle/schema";
import JobListingMenuGroup from "./components/_job-listing-menu-group";
import { jobListingsTag } from "@/lib/dataCache";
import Loading from "@/components/loading";
import { getJobListingWithApplicationsDb } from "@/features/jobListingApplications/db/job-listing-application-db";
import { getCurrentOrg } from "@/lib/auth-helpers";
import { hasOrgUserPermission } from "@/lib/permission";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent>{children}</SuspendedComponent>
    </Suspense>
  );
}

const SuspendedComponent = async ({ children }: { children: ReactNode }) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.ORG.HOME);

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
