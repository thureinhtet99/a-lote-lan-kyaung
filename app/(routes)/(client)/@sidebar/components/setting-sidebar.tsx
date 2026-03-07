import SidebarNavMenuGroup from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import { getEmployerRequest } from "@/features/users/db/user-db";
import { SidebarNavMenuType } from "@/types/index.type";
import {
  BellIcon,
  Building2Icon,
  FileUserIcon,
  Megaphone,
  User2Icon,
} from "lucide-react";

export default async function SettingsSidebar() {
  const employerRequest = await getEmployerRequest();
  const canShowOrganizationRequest =
    employerRequest.success && employerRequest.data?.status === "approved";

  const organizationRequestItem: SidebarNavMenuType[number] = {
    href: APP_ROUTES.SETTINGS.ORG_REQUEST,
    icon: <Building2Icon />,
    label: "Organization Request",
    authStatus: "signedIn",
    roles: ["employer"],
  };

  const items: SidebarNavMenuType = [
    {
      href: APP_ROUTES.SETTINGS.PROFILE,
      icon: <User2Icon />,
      authStatus: "signedIn",
      label: "Profile",
    },
    {
      href: APP_ROUTES.SETTINGS.NOTIFICATIONS,
      icon: <BellIcon />,
      authStatus: "signedIn",
      label: "Notifications",
    },
    {
      href: APP_ROUTES.SETTINGS.RESUME,
      icon: <FileUserIcon />,
      label: "Resume",
      authStatus: "signedIn",
      roles: ["user"],
    },
    {
      href: APP_ROUTES.SETTINGS.EMPLOYER_REQUEST,
      icon: <Megaphone />,
      label: "Employer Request",
      authStatus: "signedIn",
    },
    ...(canShowOrganizationRequest ? [organizationRequestItem] : []),
  ];

  return <SidebarNavMenuGroup items={items} />;
}
