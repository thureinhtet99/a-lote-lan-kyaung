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
import Loading from "@/components/shared/loading";
import { getCurrentOrg } from "@/lib/auth/auth-helpers";
import SidebarOrgButton from "@/features/organizations/components/sidebar-org-button";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/permissions";
import EmployerSidebarJobListingMenu from "@/features/employer/components/employer-sidebar-job-listing-menu";
import { getJobListingWithApplications } from "@/features/job-listings/db/job-listing-db";
import PageLoading from "@/components/shared/page-loading";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent>{children}</SuspendedComponent>
    </Suspense>
  );
}

const SuspendedComponent = async ({ children }: { children: ReactNode }) => {
  const { orgId } = await getCurrentOrg();

  // If no organization, show limited navigation without "My Organization"
  // Employers must first claim an organization before seeing "My Organization"
  if (orgId == null) {
    return (
      <AppSidebar
        content={
          <Suspense fallback={<Loading />}>
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
                  authStatus: "signedIn",
                  roles: ["employer"],
                },
              ]}
            />
          </Suspense>
        }
        footerButton={<SidebarOrgButton />}
      >
        {children}
      </AppSidebar>
    );
  }

  const jobListings = await getJobListingWithApplications(orgId);

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
                <PlusIcon size={16} />
                <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupLabel>

            {jobListings.data.length > 0 && canCreateJobListing && (
              <SidebarGroupAction title="Add job listing" asChild>
                <Link href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS_NEW}`}>
                  <PlusIcon />
                  <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            )}
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense fallback={<Loading />}>
                <EmployerSidebarJobListingMenu jobListings={jobListings.data} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>

          <Suspense fallback={<Loading />}>
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
                  href: APP_ROUTES.EMPLOYER.MY_ORG,
                  icon: <Building2Icon />,
                  label: "My Organization",
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
          </Suspense>
        </>
      }
      footerButton={<SidebarOrgButton />}
    >
      {children}
    </AppSidebar>
  );
};
