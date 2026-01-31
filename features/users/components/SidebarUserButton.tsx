import { Suspense } from "react";
import SidebarUserButtonClient from "./_SidebarUserButtonClient";
import { getCurrentUser } from "@/services/clerk/lib/get-current-auth";
import { SignOutButton } from "@/services/clerk/component/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import Loading from "@/components/Loading";

const SidebarUserSuspense = async () => {
  const { user } = await getCurrentUser({ allData: true });

  // Check if there is a user to show UserButton
  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarUserButtonClient user={user} />;
};

export default function SidebarUserButton() {
  return (
    <Suspense fallback={<Loading />}>
      <SidebarUserSuspense />
    </Suspense>
  );
}
