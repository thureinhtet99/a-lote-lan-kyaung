import { Suspense } from "react";
import JobBoardSidebar from "../shared/job-board-sidebar";
import Loading from "@/components/shared/loading";

export default function JobBoardSidebarPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JobBoardSidebar />
    </Suspense>
  );
}
