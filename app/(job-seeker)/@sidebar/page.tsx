import { Suspense } from "react";
import JobBoardSidebar from "../shared/JobBoardSidebar";
import Loading from "@/components/shared/loading";

export default function JobBoardSidebarPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JobBoardSidebar />
    </Suspense>
  );
}
