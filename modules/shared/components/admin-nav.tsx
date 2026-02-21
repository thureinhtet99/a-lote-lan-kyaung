"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { APP_ROUTES } from "@/constants/app-config";

const navItems = [
  { href: APP_ROUTES.ADMIN.HOME, label: "Overview" },
  { href: APP_ROUTES.ADMIN.USERS, label: "Users" },
  { href: APP_ROUTES.ADMIN.EMPLOYER_REQUESTS, label: "Employer Requests" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === item.href ? "text-foreground" : "text-foreground/60",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
