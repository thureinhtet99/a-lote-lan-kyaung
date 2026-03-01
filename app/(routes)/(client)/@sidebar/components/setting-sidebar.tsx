import SidebarNavMenuGroup from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import { BellIcon, Building2Icon, FileUserIcon, Megaphone } from "lucide-react";

export default function SettingsSidebar() {
  return (
    <SidebarNavMenuGroup
      items={[
        {
          href: APP_ROUTES.SETTINGS.NOTIFICATIONS,
          icon: <BellIcon />,
          label: "Notifications",
        },
        {
          href: APP_ROUTES.SETTINGS.RESUME,
          icon: <FileUserIcon />,
          label: "Resume",
        },
        {
          href: APP_ROUTES.SETTINGS.EMPLOYER_REQUEST,
          icon: <Megaphone />,
          label: "Employer Request",
        },
        {
          href: APP_ROUTES.SETTINGS.ORG_REQUEST,
          icon: <Building2Icon />,
          label: "Create Organization",
          authStatus: "signedIn",
          roles: ["employer"],
        },
      ]}
    />
  );
}
