import JobListingFilterForm from "@/components/job-listings/JobListingFilterForm";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export default function JobBoardSidebar() {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <JobListingFilterForm />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
