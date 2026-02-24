import { Suspense } from "react";
import JobBoardSidebar from "./components/job-board-sidebar";
import Loading from "@/components/shared/loading";

export default function JobBoardSidebarPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JobBoardSidebar />
    </Suspense>
  );
}
