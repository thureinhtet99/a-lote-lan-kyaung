import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ClipboardListIcon, LogInIcon, PlusIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import Link from "next/link";
import AppSidebar from "@/components/sidebar/AppSidebar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import SidebarOrgButton from "@/features/organizations/components/SidebarOrgButton";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/appConfig";
import { OrgDatabaseSync } from "@/services/clerk/component/OrgDatabaseSync";

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrg();
  if (orgId == null) return redirect(APP_ROUTES.ORG.SELECT);

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job listings</SidebarGroupLabel>
            <SidebarGroupAction title="Add job listing" asChild>
              <Link href={`${APP_ROUTES.EMPLOYER_JOB_LISTING}/new`}>
                <PlusIcon />
                <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupAction>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job board" },
              {
                href: "/sign-in",
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
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <OrgDatabaseSync />
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  );
}
