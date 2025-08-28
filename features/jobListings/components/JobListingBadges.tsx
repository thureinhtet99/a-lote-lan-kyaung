import { Badge } from "@/components/ui/badge";
import { jobListingsTable } from "@/drizzle/schema";
import { ComponentProps } from "react";
import {
  formatExpLevel,
  formatJobLisingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "../lib/formatters";
import { Banknote, BuildingIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobListingBadges({
  jobListing: {
    wage,
    wageIntervel,
    stateAbbreviation,
    city,
    type,
    experienceLevel,
    locationRequirement,
    isFeatured,
  },
  className,
}: {
  jobListing: Pick<
    typeof jobListingsTable.$inferSelect,
    | "wage"
    | "wageIntervel"
    | "stateAbbreviation"
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
            "border-featured bg-featured/50 text-featured-foreground"
          )}
        >
          Featured
        </Badge>
      )}
      {wage != null && wageIntervel != null && (
        <Badge {...badgeType}>
          <Banknote />
          {formatWage(wage, wageIntervel)}
        </Badge>
      )}
      {(stateAbbreviation != null || city != null) && (
        <Badge {...badgeType}>
          <MapPinIcon className="size-10" />
          {formatJobLisingLocation(stateAbbreviation, city)}
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
