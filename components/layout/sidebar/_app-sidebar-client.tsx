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
        {/* Sticky mobile topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-2.5 py-2.5 border-b bg-gradient-to-r from-primary to-accent shrink-0">
          <SidebarTrigger className="size-8 bg-background text-foreground shadow-sm hover:bg-muted md:hidden" />
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo size="sm" showText />
          </div>
          <div className="size-8" aria-hidden />
        </header>
        <div className="flex-1 flex overflow-hidden relative">{children}</div>
      </div>
    );
  }

  return children;
}
