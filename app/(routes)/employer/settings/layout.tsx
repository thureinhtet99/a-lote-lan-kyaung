"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";
import { Users, Mail, Building2, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNavItems = [
  {
    title: "Members",
    href: APP_ROUTES.EMPLOYER.SETTINGS.MEMBERS,
    icon: Users,
    description: "Manage organization members and roles",
  },
  {
    title: "Invitations",
    href: APP_ROUTES.EMPLOYER.SETTINGS.INVITATIONS,
    icon: Mail,
    description: "View and manage pending invitations",
  },
  {
    title: "Organization",
    href: APP_ROUTES.EMPLOYER.SETTINGS.ORGANIZATION,
    icon: Building2,
    description: "Organization profile and settings",
  },
  {
    title: "Permissions",
    href: APP_ROUTES.EMPLOYER.SETTINGS.PERMISSIONS,
    icon: Shield,
    description: "View role permissions",
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization, members, and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsNavItems.map((item) => (
              <SettingsNavLink key={item.href} item={item} />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}

function SettingsNavLink({
  item,
}: {
  item: (typeof settingsNavItems)[number];
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-start gap-3 rounded-lg px-3 py-2 transition-colors",
        "hover:text-accent",
        "group relative",
        isActive && "text-accent",
      )}
    >
      <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {item.description}
        </div>
      </div>
    </Link>
  );
}
