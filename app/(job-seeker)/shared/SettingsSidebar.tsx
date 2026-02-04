import SidebarNavMenuGroup from "@/components/sidebar/sidebar-nav-menu";
import { APP_ROUTES } from "@/config/appConfig";
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
