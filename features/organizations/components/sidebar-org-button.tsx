import { Suspense } from "react";
import SidebarOrgButtonClient from "./_sidebar-org-button-client";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ArrowRight } from "lucide-react";
import Loading from "@/components/shared/loading";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";

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
      <SidebarMenuItem className="cursor-pointer">
        <Suspense>
          <SidebarMenuButton
            className="flex items-center justify-between"
            asChild
          >
            <Link href={APP_ROUTES.SETTINGS.NOTIFICATIONS}>
              <span>Claim your organization</span>
              <ArrowRight className="animate-caret-blink" />
            </Link>
          </SidebarMenuButton>
        </Suspense>
      </SidebarMenuItem>
    );
  }

  return <SidebarOrgButtonClient user={user} organization={organization} />;
};
