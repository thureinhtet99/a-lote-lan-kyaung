"use client";

import { ReactNode, useEffect, useState } from "react";

interface ResponsiveBreakpointProps {
  breakpoint: string;
  children: ReactNode;
  otherwise?: ReactNode;
}

/**
 * Responsive component that conditionally renders content based on a media query
 * Shows children when breakpoint matches, otherwise shows 'otherwise' prop
 */
export default function ResponsiveBreakpoint({
  breakpoint,
  children,
  otherwise,
}: ResponsiveBreakpointProps) {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const controller = new AbortController();
    const media = window.matchMedia(`(${breakpoint})`);

    const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    media.addEventListener("change", updateMatches, {
      signal: controller.signal,
    });

    // Set initial value
    updateMatches(media);

    return () => {
      controller.abort();
    };
  }, [breakpoint]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return <>{matches ? children : otherwise}</>;
}
