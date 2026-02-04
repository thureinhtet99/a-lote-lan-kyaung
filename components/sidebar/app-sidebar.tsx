import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebarClient } from "./_app-sidebar-client";
import { APP_CONFIG } from "@/config/appConfig";
import { SignedIn } from "@/components/auth/AuthStatus";

export default function AppSidebar({
  content,
  footerButton,
  children,
}: {
  content: ReactNode;
  footerButton: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        {/* Left */}
        <Sidebar collapsible="icon" className="overflow-hidden">
          <SidebarHeader className="flex-row items-center lg:space-x-4">
            <SidebarTrigger />
            <span className="text-2xl text-nowrap">{APP_CONFIG.APP_NAME}</span>
          </SidebarHeader>

          <SidebarContent>{content}</SidebarContent>

          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>

        {/* Right */}
        <main className="flex-1">{children}</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
