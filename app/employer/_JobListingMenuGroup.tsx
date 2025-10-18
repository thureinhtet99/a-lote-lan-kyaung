"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { jobListingsTable, JobListingStatusType } from "@/drizzle/schema";
import { useParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/appConfig";

type JobListingMenuGroupType = Pick<
  typeof jobListingsTable.$inferInsert,
  "title" | "id"
> & {
  applications: number;
};

const JobListingMenuItem = ({
  id,
  title,
  applications,
}: JobListingMenuGroupType) => {
  const { jobListingId } = useParams();

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton isActive={jobListingId === id} asChild>
        <Link href={`${APP_ROUTES.EMPLOYER.JOB_LISTING}/${id}`}>
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuSubButton>
      {applications > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {applications}
        </div>
      )}
    </SidebarMenuSubItem>
  );
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
            <SidebarMenuSub>
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
