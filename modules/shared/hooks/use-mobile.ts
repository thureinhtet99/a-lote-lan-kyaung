import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(
        `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
      );
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
    () => false,
  );
}
