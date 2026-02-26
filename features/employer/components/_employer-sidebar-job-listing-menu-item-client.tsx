"use client";

import { Badge } from "@/components/ui/badge";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { APP_ROUTES } from "@/constants/app-config";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EmployerSidebarJobListingMenuItemClient({
  id,
  title,
  applications,
}: {
  id: string;
  title: string;
  applications: number;
}) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenuSubItem className="flex items-center justify-between">
      <Link href={`${APP_ROUTES.EMPLOYER.JOB_LISTINGS}/${id}`}>
        <SidebarMenuSubButton
          isActive={jobListingId === id}
          asChild
          className="truncate"
        >
          <span className="truncate">{title}</span>
        </SidebarMenuSubButton>
      </Link>
      {applications > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {applications}
        </Badge>
      )}
    </SidebarMenuSubItem>
  );
}
