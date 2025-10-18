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
import { SignedIn } from "@/services/clerk/component/AuthStatus";
import { AppSidebarClient } from "./_AppSidebarClient";
import { APP_CONFIG } from "@/config/appConfig";

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
          <SidebarHeader className="flex-row items-center">
            <SidebarTrigger />
            <span className="text-xl text-nowrap">{APP_CONFIG.APP_NAME}</span>
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
