"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { APP_ROUTES } from "@/constants/app-config";
import { SignOutButton } from "@/features/auth/components/auth-buttons";
import {
  ArrowLeftRightIcon,
  Building2Icon,
  ChevronsUpDown,
  CreditCardIcon,
  LogOutIcon,
  UserRoundCogIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserType = {
  email: string;
};
type OrganizationType = {
  name: string;
  logo: string | null;
};

export default function SidebarOrgButtonClient({
  user,
  organization,
}: {
  user: UserType;
  organization: OrganizationType;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();

  const openOrganizationProfile = () => {
    router.push(APP_ROUTES.EMPLOYER.ORG);
    setOpenMobile(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <OrgInfo user={user} organization={organization} />
          <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={4}
        align="end"
        side={isMobile ? "bottom" : "right"}
        className="min-w-64 max-w-80"
      >
        <DropdownMenuLabel className="font-normal p-1">
          <OrgInfo user={user} organization={organization} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={openOrganizationProfile}>
          <Building2Icon className="mr-1" />
          Manage organization
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.EMPLOYER.SETTINGS.HOME}>
            <UserRoundCogIcon className="mr-1" />
            User settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.EMPLOYER.PRICING}>
            <CreditCardIcon className="mr-1" />
            Change plan
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.EMPLOYER.ORG}>
            <ArrowLeftRightIcon className="mr-1" />
            Switch organization
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* Sign out */}
        <SignOutButton>
          <DropdownMenuItem>
            <LogOutIcon className="mr-1" />
            Log Out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const OrgInfo = ({
  user,
  organization,
}: {
  user: UserType;
  organization: OrganizationType;
}) => {
  const nameInitials = organization.name
    .split(" ")
    .slice(0, 2)
    .map((str) => str[0])
    .join("");
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Avatar className="rounded-lg size-8">
        <AvatarImage
          src={organization.logo ?? undefined}
          alt={organization.name}
        />
        <AvatarFallback className="uppercase bg-primary text-primary-foreground">
          {nameInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate text-sm font-semibold">
          {organization.name}
        </span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </div>
  );
};
