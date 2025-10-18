import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ClipboardListIcon, LogInIcon, PlusIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import Link from "next/link";
import AppSidebar from "@/components/sidebar/AppSidebar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import SidebarOrgButton from "@/features/organizations/components/SidebarOrgButton";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { APP_ROUTES } from "@/config/appConfig";
import OrgDatabaseSync from "@/services/clerk/component/OrgDatabaseSync";
import CheckCondition from "@/components/CheckCondition";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";
import { getJobListingDb } from "@/features/jobListings/db/jobListings";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { sortJobListingsByStatus } from "@/features/jobListings/lib/utils";
import { JobListingStatusType } from "@/drizzle/schema";
import JobListingMenuGroup from "./_JobListingMenuGroup";
import { jobListingGlobalTag } from "@/lib/dataCache";

const JobListingMenu = async ({ orgId }: { orgId: string }) => {
  // Get job listings (cached)
  const cachedData = unstable_cache(
    async () => await getJobListingDb(orgId),
    [orgId],
    {
      tags: [jobListingGlobalTag(orgId, "jobListings")],
    }
  );

  const jobListings = await cachedData();
  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission("job_listing:create"))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={APP_ROUTES.EMPLOYER.JOB_LISTING_NEW}>
              <PlusIcon />
              Create your first job listing
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

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

const SuspenseComponent = async ({ children }: { children: ReactNode }) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.ORG.SELECT);

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job listings</SidebarGroupLabel>
            <CheckCondition
              condition={() => hasOrgUserPermission("job_listing:create")}
            >
              <SidebarGroupAction title="Add job listing" asChild>
                <Link href={`${APP_ROUTES.EMPLOYER.JOB_LISTING_NEW}`}>
                  <PlusIcon />
                  <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </CheckCondition>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingMenu orgId={orgId} />
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

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <OrgDatabaseSync />
      <SuspenseComponent>{children}</SuspenseComponent>
    </Suspense>
  );
}
