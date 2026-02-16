import { Suspense } from "react";
import SidebarOrgButtonClient from "./_sidebar-org-button-client";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { SignOutButton } from "@/components/auth/auth-buttons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import Loading from "@/components/shared/loading";

export default function SidebarOrgButton() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrg({ allData: true }),
  ]);
  if (user == null || organization == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarOrgButtonClient user={user} organization={organization} />;
};
