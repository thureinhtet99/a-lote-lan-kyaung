import ActionButton from "@/components/shared/action-button";
import CheckCondition from "@/components/shared/check-condition";
import { toggleJobListingFeaturedStatus } from "@/features/job-listings/actions";
import { hasReachedMaxFeaturedJobListings } from "@/features/job-listings/lib/plan-feature-helpers";
import UpgradePopOver from "./upgrade-popover";
import { StarIcon, StarOffIcon } from "lucide-react";
import { hasOrgUserPermission } from "@/lib/utils/permissions";

export default function FeatureToggleButton({
  isFeatured,
  id,
}: {
  isFeatured: boolean;
  id: string;
}) {
  return (
    <CheckCondition
      condition={() => hasOrgUserPermission("job_listing", ["change_status"])}
    >
      {isFeatured ? (
        <ActionButton
          variant="outline"
          action={toggleJobListingFeaturedStatus.bind(null, id)}
        >
          {featuredToggleButtonText(isFeatured)}
        </ActionButton>
      ) : (
        <CheckCondition
          condition={async () => {
            const isMax = await hasReachedMaxFeaturedJobListings();
            return !isMax;
          }}
          otherwise={
            <UpgradePopOver
              buttonText={featuredToggleButtonText(isFeatured)}
              popOverText="You must upgrade your plan to feature more job listings"
            />
          }
        >
          <ActionButton
            variant="outline"
            action={toggleJobListingFeaturedStatus.bind(null, id)}
          >
            {featuredToggleButtonText(isFeatured)}
          </ActionButton>
        </CheckCondition>
      )}
    </CheckCondition>
  );
}

const featuredToggleButtonText = (isFeatured: boolean) => {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        Unfeature
      </>
    );
  }

  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
};
