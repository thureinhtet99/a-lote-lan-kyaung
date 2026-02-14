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
import { SignedIn } from "@/components/features/auth/AuthStatus";
import { Logo } from "@/components/shared/Logo";

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
    <SidebarProvider className="overflow-hidden">
      <AppSidebarClient>
        {/* Left */}
        <Sidebar
          collapsible="icon"
          className="overflow-hidden border-r border-primary/10"
        >
          <SidebarHeader className="flex-row items-center justify-center gap-2 py-4 border-b border-primary/10">
            <Logo size="sm" showText={true} />
          </SidebarHeader>

          <SidebarContent>{content}</SidebarContent>

          <SignedIn>
            <SidebarFooter className="border-t border-primary/10">
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>

        {/* Right */}
        <main className="flex-1 bg-gradient-to-br from-background via-primary/[0.02] to-secondary/[0.02] relative">
          <SidebarTrigger className="absolute" />

          {children}
        </main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
