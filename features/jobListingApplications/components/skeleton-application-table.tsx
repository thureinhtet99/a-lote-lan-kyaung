import Loading from "@/components/loading";
import ApplicationTable from "./application-table";

export default function SkeletonApplicationTable() {
  return (
    <ApplicationTable
      applications={[]}
      canUpdateRating={false}
      canUpdateStatus={false}
      noResultMessage={<Loading />}
      disableToolbar
    />
  );
}
