"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to check if a media query matches
 * @param breakpoint - Media query string (e.g., "min-width: 768px")
 * @returns boolean indicating if the breakpoint matches
 */
export function useBreakpoint(breakpoint: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const media = window.matchMedia(`(${breakpoint})`);

    const updateMatches = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener("change", updateMatches, {
      signal: controller.signal,
    });

    // Set initial value
    setMatches(media.matches);

    return () => {
      controller.abort();
    };
  }, [breakpoint]);

  return matches;
}

/**
 * Preset breakpoint hooks for common use cases
 */
export function useIsMobile() {
  return useBreakpoint("max-width: 768px");
}

export function useIsTablet() {
  return useBreakpoint("min-width: 768px and max-width: 1024px");
}

export function useIsDesktop() {
  return useBreakpoint("min-width: 1024px");
}
