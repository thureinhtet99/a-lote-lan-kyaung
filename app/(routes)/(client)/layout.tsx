import { ReactNode, Suspense } from "react";
import SidebarUserButton from "@/app/(routes)/(client)/@sidebar/components/sidebar-user-button";
import AppSidebar from "@/components/layout/sidebar/app-sidebar";
import SidebarNavMenu from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import { getCurrentSession } from "@/lib/auth/auth-helpers";
import { SidebarNavMenuType } from "@/types/index.type";
import {
  Building2Icon,
  BuildingIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogInIcon,
} from "lucide-react";
import Loading from "@/components/shared/loading";

const baseSidebarItems: SidebarNavMenuType = [
  {
    href: APP_ROUTES.HOME,
    icon: <ClipboardListIcon />,
    label: "Job board",
  },
  {
    href: APP_ROUTES.ORGANIZATIONS.HOME,
    icon: <Building2Icon />,
    label: "Organizations",
    roles: ["user"],
  },
  {
    href: APP_ROUTES.EMPLOYER.HOME,
    icon: <LayoutDashboardIcon />,
    label: "Employer dashboard",
    authStatus: "signedIn",
    roles: ["employer"],
  },
];

const myOrganizationItem: SidebarNavMenuType[number] = {
  href: APP_ROUTES.EMPLOYER.MY_ORG,
  icon: <BuildingIcon />,
  label: "My organization",
  authStatus: "signedIn",
  roles: ["employer"],
};

const signInItem: SidebarNavMenuType[number] = {
  href: APP_ROUTES.SIGN_IN,
  icon: <LogInIcon />,
  label: "Sign In",
  authStatus: "signedOut",
};

export default function ClientLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <AppSidebar
      content={
        <>
          {sidebar}
          <Suspense>
            <SidebarNavMenuWithSession className="mt-auto" />
          </Suspense>
        </>
      }
      footerButton={<SidebarUserButton />}
    >
      <div className="flex-1">{children}</div>
    </AppSidebar>
  );
}

const SidebarNavMenuWithSession = async ({
  className,
}: {
  className?: string;
}) => {
  const { session } = await getCurrentSession();
  const hasActiveOrganization = Boolean(session?.activeOrganizationId);

  const items: SidebarNavMenuType = hasActiveOrganization
    ? [...baseSidebarItems, myOrganizationItem, signInItem]
    : [...baseSidebarItems, signInItem];

  return <SidebarNavMenu className={className} items={items} />;
};
