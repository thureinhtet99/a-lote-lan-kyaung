"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/constants/app-config";

const navItems = [
  { href: APP_ROUTES.ADMIN.HOME, label: "Overview" },
  { href: APP_ROUTES.ADMIN.USERS, label: "Users" },
  { href: APP_ROUTES.ADMIN.EMPLOYER_REQUESTS, label: "Employer Requests" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5 text-xs font-medium sm:gap-2 sm:text-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "shrink-0 rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground/80 sm:px-3",
            pathname === item.href ? "text-white" : "text-foreground/60",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
