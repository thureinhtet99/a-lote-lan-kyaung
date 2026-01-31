import { useSyncExternalStore } from "react";

export function useDarkMode() {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },

    // Get function
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,

    // Server snapshot
    () => false,
  );
}
