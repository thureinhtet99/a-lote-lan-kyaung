import { Suspense } from "react";
import SidebarOrgButtonClient from "./_sidebar-org-button-client";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ArrowRight, LogOutIcon } from "lucide-react";
import Loading from "@/components/shared/loading";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import SidebarUserButtonClient from "@/app/(routes)/(client)/@sidebar/components/_sidebar-user-button-client";
import { getUnreadNotificationsCount } from "../db/notification-db";
import { SignOutButton } from "@/features/auth/components/auth-buttons";

export default function SidebarOrgButton() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  // const [{ user }, { organization }] = await Promise.all([
  //   getCurrentUser(),
  //   getCurrentOrg(),
  // ]);

  const { user: currentUser } = await getCurrentUser();
  const { organization: currentOrganization } = await getCurrentOrg();

  if (!currentUser) {
    return (
      <SignOutButton>
        <SidebarMenuButton className="cursor-pointer">
          <LogOutIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  const userData = {
    name: currentUser.name,
    email: currentUser.email,
    image: currentUser.image ?? null,
  };

  // Get unread notification count
  const { count: unreadCount } = await getUnreadNotificationsCount();

  if (!currentOrganization) {
    return (
      <SidebarUserButtonClient user={userData} unreadCount={unreadCount} />
      // <Suspense>
      //   <SidebarMenuButton className="flex items-center justify-between" asChild>
      //     <Link href={APP_ROUTES.SETTINGS.NOTIFICATIONS}>
      //       <span>Claim your organization</span>
      //       <ArrowRight className="animate-caret-blink" />
      //     </Link>
      //   </SidebarMenuButton>
      // </Suspense>
    );
  }

  return (
    <SidebarOrgButtonClient
      user={currentUser}
      organization={currentOrganization}
    />
  );
};
