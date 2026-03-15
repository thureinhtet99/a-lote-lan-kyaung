import { JobListingStatusType } from "@/drizzle/schema";
import { sortJobListingsByStatus } from "@/features/job-listings/lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatJobListingStatus } from "@/features/job-listings/lib/formatters";
import { ChevronRightIcon } from "lucide-react";
import EmployerSidebarJobListingMenuItemClient from "./_employer-sidebar-job-listing-menu-item-client";

export default async function EmployerSidebarJobListingMenu({
  jobListings,
}: {
  jobListings: {
    id: string;
    title: string;
    status: "draft" | "published" | "delisted";
    applications: number;
  }[];
}) {
  return Object.entries(Object.groupBy(jobListings, (obj) => obj.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatusType,
        b as JobListingStatusType,
      );
    })
    .map(([status, jobListings]) => {
      return (
        <SidebarMenu key={status}>
          <Collapsible defaultOpen={true} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="text-muted-foreground">
                  {formatJobListingStatus(status as JobListingStatusType)}
                  <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="p-1">
                  {jobListings.map((job) => (
                    <EmployerSidebarJobListingMenuItemClient
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      applications={job.applications}
                    />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      );
    });
}
