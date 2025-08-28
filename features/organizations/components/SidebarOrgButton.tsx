import { Suspense } from "react";
import SidebarOrgButtonClient from "./_SidebarOrgButtonClient";
import {
  getCurrentOrg,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { SignOutButton } from "@/services/clerk/component/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

const SidebarOrgSuspense = async () => {
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

export default function SidebarOrgButton() {
  return (
    <Suspense>
      <SidebarOrgSuspense />
    </Suspense>
  );
}
