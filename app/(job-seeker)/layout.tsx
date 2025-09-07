import {
  BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogInIcon,
} from "lucide-react";
import { ReactNode } from "react";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import AppSidebar from "@/components/sidebar/AppSidebar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { APP_ROUTES } from "@/lib/appConfig";

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
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
              href: APP_ROUTES.AI_SEARCH,
              icon: <BrainCircuitIcon />,
              label: "AI search",
            },
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
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
