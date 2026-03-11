"use client";

import LoadingSwap from "@/components/shared/loading-swap";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useSignOut } from "@/hooks/use-sign-out";
import { UserType } from "@/types/index.type";
import {
  BellIcon,
  ChevronsUpDown,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SidebarUserButtonClient({
  user,
  unreadCount,
}: {
  user: Pick<UserType, "name" | "email" | "image">;
  unreadCount: number;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, isPending } = useSignOut();

  const openUserProfile = () => {
    router.push(APP_ROUTES.SETTINGS.PROFILE);
    setOpenMobile(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
        >
          <UserInfo {...user} />
          {unreadCount > 0 && (
            <Badge className="ml-auto group-data-[state=collapsed]:absolute -right-1 top-0 size-4">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
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
          <UserInfo {...user} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={openUserProfile}>
          <UserIcon className="mr-1 focus:text-accent-foreground" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href={APP_ROUTES.SETTINGS.NOTIFICATIONS}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <BellIcon className="mr-1 focus:text-accent-foreground" />
              Notifications
            </div>
            {unreadCount > 0 && (
              <Badge className="ml-auto ">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.SETTINGS.NOTIFICATIONS}>
            <SettingsIcon className="mr-1 focus:text-accent-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault();
          }}
          onClick={() => signOut({ onSuccess: () => setIsOpen(false) })}
        >
          <LogOutIcon className="mr-1 focus:text-accent-foreground" />
          <LoadingSwap isLoading={isPending} children="Log out" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const UserInfo = ({
  name,
  email,
  image,
}: Pick<UserType, "name" | "email" | "image">) => {
  const nameInitials = name.slice(0, 1);

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Avatar className="size-10 group-data-[state=collapsed]:size-8">
        <AvatarImage src={image || undefined} alt={name} />
        <AvatarFallback className="uppercase bg-primary/10 text-primary text-xl group-data-[state=collapsed]:text-md">
          {nameInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </div>
  );
};
