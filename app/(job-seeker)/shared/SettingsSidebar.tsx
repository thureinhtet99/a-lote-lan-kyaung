import SidebarNavMenuGroup from "@/components/layout/sidebar/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import { BellIcon, FileUserIcon } from "lucide-react";

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
      ]}
    />
  );
}
