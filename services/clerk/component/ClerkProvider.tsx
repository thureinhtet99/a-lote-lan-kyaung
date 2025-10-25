"use client";

import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { ReactNode, Suspense } from "react";
import { dark } from "@clerk/themes";
import { useDarkMode } from "@/hooks/use-darkmode";
import { UserDatabaseSync } from "./UserDatabaseSync";

export function ClerkProvider({ children }: { children: ReactNode }) {
  const isDarkMode = useDarkMode();

  return (
    <Suspense>
      <OriginalClerkProvider
        appearance={isDarkMode ? { baseTheme: [dark] } : undefined}
      >
        {/* This component will sync user data with our database */}
        <UserDatabaseSync /> 
        {children}
      </OriginalClerkProvider>
    </Suspense>
  );
}
