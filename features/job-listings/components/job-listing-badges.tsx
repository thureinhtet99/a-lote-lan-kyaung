import { Badge } from "@/components/ui/badge";
import { jobListingTable } from "@/drizzle/schema";
import { ComponentProps } from "react";
import { Banknote, BuildingIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatExpLevel,
  formatJobListingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "@/features/job-listings/lib/formatters";

export default function JobListingBadges({
  jobListing: {
    wage,
    wageInterval,
    state,
    city,
    type,
    experienceLevel,
    locationRequirement,
    isFeatured,
  },
  className,
}: {
  jobListing: Pick<
    typeof jobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "state"
    | "city"
    | "type"
    | "experienceLevel"
    | "locationRequirement"
    | "isFeatured"
  >;
  className?: string;
}) {
  const badgeType = {
    variant: "outline",
    className,
  } satisfies ComponentProps<typeof Badge>;

  return (
    <>
      {isFeatured && (
        // Custom edit Badge in globals.css
        <Badge
          className={cn(
            className,
            "border-featured bg-featured/50 text-featured-foreground",
          )}
        >
          Featured
        </Badge>
      )}

      {wage != null && wageInterval != null && (
        <Badge {...badgeType}>
          <Banknote />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}

      {(state != null || city != null) && (
        <Badge {...badgeType}>
          <MapPinIcon className="size-10" />
          {formatJobListingLocation(state, city)}
        </Badge>
      )}

      {locationRequirement != null && (
        <Badge {...badgeType}>
          <BuildingIcon className="size-10" />
          {formatLocationRequirement(locationRequirement)}
        </Badge>
      )}

      {type != null && (
        <Badge {...badgeType}>
          <BuildingIcon className="size-10" />
          {formatJobType(type)}
        </Badge>
      )}

      {experienceLevel != null && (
        <Badge {...badgeType}>
          <BuildingIcon className="size-10" />
          {formatExpLevel(experienceLevel)}
        </Badge>
      )}
    </>
  );
}
