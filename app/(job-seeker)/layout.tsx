import { ReactNode } from "react";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import AppSidebar from "@/components/sidebar/AppSidebar";
import JobSeekerSidebar from "./_components/JobSeekerSidebar";

export default function JobSeekerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppSidebar
      content={<JobSeekerSidebar />}
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
