import Loading from "@/components/shared/loading";
import ApplicationTable from "./application-table";

export default function SkeletonApplicationTable() {
  return (
    <ApplicationTable
      applications={[]}
      canUpdateStatus={false}
      noResultMessage={<Loading />}
      disableToolbar
    />
  );
}
