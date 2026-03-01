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
import { SignedIn } from "@/features/auth/components/auth-statuses";
import { Logo } from "@/components/shared/logo";

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
          className="overflow-hidden border-r border-primary"
        >
          <SidebarHeader className="px-4 h-[72px] flex items-center justify-center border-b border-sidebar-border bg-gradient-to-r from-accent to-primary">
            <Logo size="sm" showText={true} />
          </SidebarHeader>

          <SidebarContent className="relative pt-8 overflow-y-auto">
            <div className="hidden md:flex items-center absolute top-1 right-1 z-20">
              <SidebarTrigger className="size-8 bg-background text-foreground shadow-sm hover:bg-muted mr-0.5" />
            </div>
            {content}
          </SidebarContent>

          <SignedIn>
            <SidebarFooter className="border-t border-sidebar-border bg-sidebar px-2 py-2">
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>

        {/* Right */}
        <main className="flex-1 bg-background overflow-y-auto flex flex-col min-w-0">
          {children}
        </main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
