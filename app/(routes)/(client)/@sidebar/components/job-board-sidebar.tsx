import JobBoardForm from "@/app/(routes)/(client)/@sidebar/components/job-board-form";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export default function JobBoardSidebar() {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <JobBoardForm />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
