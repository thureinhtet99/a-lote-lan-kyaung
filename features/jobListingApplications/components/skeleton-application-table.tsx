import Loading from "@/components/Loading";
import ApplicationTable from "./ApplicationTable";

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
