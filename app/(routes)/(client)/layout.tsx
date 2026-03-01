import { ReactNode, Suspense } from "react";
import SidebarUserButton from "@/app/(routes)/(client)/@sidebar/components/sidebar-user-button";
import AppSidebar from "@/components/layout/sidebar/app-sidebar";
import SidebarNavMenu from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import {
  Building2Icon,
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
          <Suspense>
            <SidebarNavMenu
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
          </Suspense>
        </>
      }
      footerButton={<SidebarUserButton />}
    >
      <div className="flex-1 items-center justify-center ">{children}</div>
    </AppSidebar>
  );
}
