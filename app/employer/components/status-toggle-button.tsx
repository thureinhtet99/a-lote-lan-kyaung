import CheckCondition from "@/components/CheckCondition";
import { JobListingStatusType } from "@/drizzle/schema";
import { hasReachedMaxPublishedJobListings } from "@/features/jobListings/lib/plan-feature-helpers";
import { nextJobListingStatus } from "@/features/jobListings/lib/utils";
import { hasOrgUserPermission } from "@/services/clerk/lib/org-user-permission";
import UpgradePopOver from "./upgrade-popover";
import ActionButton from "@/components/ActionButton";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toggleJobListingStatus } from "@/features/jobListings/actions";

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
      condition={() => hasOrgUserPermission("job_listing:change_status")}
    >
      {nextStatus === "published" ? (
        <CheckCondition
          condition={async () => {
            const isMax = await hasReachedMaxPublishedJobListings();
            return !isMax;
          }}
          otherwise={
            <UpgradePopOver
              buttonText={statusToggleButtonText(status)}
              popOverText="You must upgrade your plan to publish more job listings"
            />
          }
        >
          <ActionButton
            variant="outline"
            action={toggleJobListingStatus.bind(null, id)}
            areYouSure={shouldShowAlert}
            sureDescription={alertDescription}
          >
            {statusToggleButtonText(status)}
          </ActionButton>
        </CheckCondition>
      ) : (
        <ActionButton
          variant="outline"
          action={toggleJobListingStatus.bind(null, id)}
          areYouSure={shouldShowAlert}
          sureDescription={alertDescription}
        >
          {statusToggleButtonText(status)}
        </ActionButton>
      )}
    </CheckCondition>
  );
}

const statusToggleButtonText = (status: JobListingStatusType) => {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Invalid status: ${status satisfies never}`);
  }
};
