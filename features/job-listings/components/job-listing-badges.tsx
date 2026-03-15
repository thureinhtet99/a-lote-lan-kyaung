import { jobListingTable } from "@/drizzle/schema";
import { Dot } from "lucide-react";
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
    city,
    type,
    experienceLevel,
    locationRequirement,
  },
}: {
  jobListing: Pick<
    typeof jobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "city"
    | "type"
    | "experienceLevel"
    | "locationRequirement"
  >;
}) {
  const items = [
    wage != null && wageInterval != null
      ? formatWage(wage, wageInterval)
      : null,
    city != null ? formatJobListingLocation(city) : null,
    locationRequirement != null
      ? formatLocationRequirement(locationRequirement)
      : null,
    type != null ? formatJobType(type) : null,
    experienceLevel != null ? formatExpLevel(experienceLevel) : null,
  ].filter((value): value is string => Boolean(value && value.trim()));

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center text-sm text-muted-foreground",
      )}
    >
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center">
          {index > 0 && <Dot className="size-8 text-muted-foreground/80" />}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
