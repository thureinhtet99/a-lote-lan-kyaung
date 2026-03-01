"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";

export function AppSidebarClient({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col w-full min-h-dvh">
        <div className="fixed left-2 top-1/2 -translate-y-1/2 z-30 md:hidden">
          <SidebarTrigger className="size-8 bg-background text-foreground shadow-sm hover:bg-muted" />
        </div>

        {/* Sticky mobile topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-center gap-2 px-4 py-2.5 border-b bg-gradient-to-r from-primary to-accent shrink-0">
          <Logo size="sm" showText />
        </header>
        <div className="flex-1 flex overflow-hidden relative">{children}</div>
      </div>
    );
  }

  return children;
}
