"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { jobListingTable, JobListingStatusType } from "@/drizzle/schema";
import { useParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { Badge } from "@/components/ui/badge";

type JobListingMenuGroupType = Pick<
  typeof jobListingTable.$inferInsert,
  "title" | "id"
> & {
  applications: number;
};

export default function JobListingMenuGroup({
  status,
  jobListings,
}: {
  status: JobListingStatusType;
  jobListings: JobListingMenuGroupType[];
}) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== "delisted" ||
          jobListings.find((job) => job.id === jobListingId) != null
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="p-1">
              {jobListings.map((job) => (
                <JobListingMenuItem key={job.id} {...job} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}

const JobListingMenuItem = ({
  id,
  title,
  applications,
}: JobListingMenuGroupType) => {
  const { jobListingId } = useParams();

  return (
    <SidebarMenuSubItem className="flex items-center gap-2">
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
};
