import {
  ExperienceLevelType,
  JobListingStatusType,
  JobListingTypeType,
  LocationRequirementType,
  WageIntervalType,
} from "@/drizzle/schema";

export function formatWageInterval(interval: WageIntervalType) {
  switch (interval) {
    case "hourly":
      return "Hour";
    case "yearly":
      return "Year";
    case "monthly":
      return "Month";

    default:
      throw new Error(`Invalid wage interval: ${interval satisfies never}`);
  }
}

export function formatLocationRequirement(require: LocationRequirementType) {
  switch (require) {
    case "on-site":
      return "On-site";
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";

    default:
      throw new Error(
        `Invalid location requirement: ${require satisfies never}`
      );
  }
}

export function formatJobType(type: JobListingTypeType) {
  switch (type) {
    case "full-time":
      return "Full-time";
    case "internship":
      return "Internship";
    case "part-time":
      return "Part-time";
    default:
      throw new Error(`Invalid job type: ${type satisfies never}`);
  }
}

export function formatExpLevel(exp: ExperienceLevelType) {
  switch (exp) {
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid-level";
    case "senior":
      return "Senior";
    default:
      throw new Error(`Invalid experience level: ${exp satisfies never}`);
  }
}

export function formatJobListingStatus(status: JobListingStatusType) {
  switch (status) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    case "delisted":
      return "Delisted";
    default:
      throw new Error(`Invalid job-listing status: ${status satisfies never}`);
  }
}

export function formatWage(wage: number, wageIntervel: WageIntervalType) {
  const wageFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
  });

  switch (wageIntervel) {
    case "hourly":
      return `${wageFormatter.format(wage)} / hr`;
    case "monthly":
      return `${wageFormatter.format(wage)} / mth`;
    case "yearly":
      return wageFormatter.format(wage);

    default:
      throw new Error(`Invalid wage intervel: ${wageIntervel satisfies never}`);
  }
}

export function formatJobListingLocation(
  stateAbbreviation: string | null,
  city: string | null
) {
  if (stateAbbreviation == null && city == null) return "none";

  const locationParts = [];
  if (city != null) locationParts.push(city);
  if (stateAbbreviation != null) locationParts.push(stateAbbreviation);

  return locationParts.join(", ");
}
