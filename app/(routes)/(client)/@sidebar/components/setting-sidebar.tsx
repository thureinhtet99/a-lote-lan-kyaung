import SidebarNavMenuGroup from "@/app/(routes)/(client)/@sidebar/components/sidebar-nav-menu";
import { APP_ROUTES } from "@/constants/app-config";
import { getEmployerRequest } from "@/features/users/db/user-db";
import { SidebarNavMenuType } from "@/types/index.type";
import { Suspense } from "react";
import {
  BellIcon,
  Building2Icon,
  FileUserIcon,
  Megaphone,
  User2Icon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/auth-helpers";

const baseItems: SidebarNavMenuType = [
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
];

export default function SettingsSidebar() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { user } = await getCurrentUser();
  if (!user) return true;

  const canShowOrganizationRequest = user?.role === "employer";

  const organizationRequestItem: SidebarNavMenuType[number] = {
    href: APP_ROUTES.SETTINGS.ORG_REQUEST,
    icon: <Building2Icon />,
    label: "Organization Request",
    authStatus: "signedIn",
    roles: ["employer"],
  };

  const items: SidebarNavMenuType = canShowOrganizationRequest
    ? [...baseItems, organizationRequestItem]
    : baseItems;

  return <SidebarNavMenuGroup items={items} />;
};
