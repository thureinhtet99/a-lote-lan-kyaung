import { ReactNode } from "react";
import SidebarUserButton from "@/app/(routes)/(client)/@sidebar/components/sidebar-user-button";
import AppSidebar from "@/components/layout/sidebar/app-sidebar";
import SidebarNavMenu from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import {
  // BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogInIcon,
} from "lucide-react";

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
          <SidebarNavMenu
            className="mt-auto"
            items={[
              {
                href: APP_ROUTES.HOME,
                icon: <ClipboardListIcon />,
                label: "Job board",
              },
              // {
              //   href: APP_ROUTES.AI_SEARCH,
              //   icon: <BrainCircuitIcon />,
              //   label: "AI search",
              // },
              {
                href: APP_ROUTES.EMPLOYER.HOME,
                icon: <LayoutDashboardIcon />,
                label: "Employer dashboard",
                authStatus: "signedIn",
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
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
