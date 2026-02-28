import CheckCondition from "@/components/shared/check-condition";
import { JobListingStatusType } from "@/drizzle/schema";
import { nextJobListingStatus } from "@/features/job-listings/lib/utils";
import ActionButton from "@/components/shared/action-button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { hasOrgUserPermissionLegacy as hasOrgUserPermission } from "@/lib/utils/permissions";
import { toggleJobListingStatus } from "../db/job-listing-db";

export default function StatusToggleButton({
  status,
  id,
}: {
  status: JobListingStatusType;
  id: string;
}) {
  const nextStatus = nextJobListingStatus(status);
  const shouldShowAlert =
    nextStatus === "published" || nextStatus === "delisted";
  const alertDescription =
    nextStatus === "published"
      ? "This will immediately show this job listing to all users."
      : "This will immediately hide this job listing from all users.";

  return (
    <CheckCondition
      condition={() => hasOrgUserPermission("job_listing.change_status")}
    >
      {nextStatus === "published" ? (
        // <CheckCondition
        //   condition={async () => {
        //     const isMax = await hasReachedMaxPublishedJobListings();
        //     return !isMax;
        //   }}
        //   otherwise={
        //     <UpgradePopOver
        //       buttonText={statusToggleButtonText(status)}
        //       popOverText="You must upgrade your plan to publish more job listings"
        //     />
        //   }
        // >
        //   <ActionButton
        //     variant="outline"
        //     action={toggleJobListingStatus.bind(null, id)}
        //     areYouSure={shouldShowAlert}
        //     sureDescription={alertDescription}
        //   >
        //     {statusToggleButtonText(status)}
        //   </ActionButton>
        // </CheckCondition>
        <ActionButton
          variant="outline"
          action={toggleJobListingStatus.bind(null, id)}
          areYouSure={shouldShowAlert}
          sureDescription={alertDescription}
        >
          <EyeIcon className="size-4" />
          Publish
        </ActionButton>
      ) : (
        <ActionButton
          variant="outline"
          action={toggleJobListingStatus.bind(null, id)}
          areYouSure={shouldShowAlert}
          sureDescription={alertDescription}
        >
          <EyeOffIcon className="size-4" />
          Delist
        </ActionButton>
      )}
    </CheckCondition>
  );
}
