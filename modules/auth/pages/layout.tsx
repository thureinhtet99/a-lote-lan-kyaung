import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}
