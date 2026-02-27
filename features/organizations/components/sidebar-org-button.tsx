import { Suspense } from "react";
import SidebarOrgButtonClient from "./_sidebar-org-button-client";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ArrowRight } from "lucide-react";
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
    getCurrentUser(),
    getCurrentOrg(),
  ]);

  if (user == null || organization == null) {
    return (
      <SidebarMenuButton className="flex items-center justify-between">
        <span className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
          Select organization first
        </span>
        <ArrowRight className="animate-caret-blink" />
      </SidebarMenuButton>
    );
  }

  return <SidebarOrgButtonClient user={user} organization={organization} />;
};
