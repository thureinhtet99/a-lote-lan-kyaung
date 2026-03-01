import {
  ExperienceLevelType,
  JobListingStatusType,
  JobListingTypeType,
  LocationRequirementType,
  WageIntervalType,
} from "@/drizzle/schema";

export const formatWageInterval = (interval: WageIntervalType) => {
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
};

export const formatLocationRequirement = (require: LocationRequirementType) => {
  switch (require) {
    case "on-site":
      return "On-site";
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";

    default:
      throw new Error(
        `Invalid location requirement: ${require satisfies never}`,
      );
  }
};

export const formatJobType = (type: JobListingTypeType) => {
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
};

export const formatExpLevel = (exp: ExperienceLevelType) => {
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
};

export const formatJobListingStatus = (status: JobListingStatusType) => {
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
};

export const formatWage = (wage: number, wageInterval: WageIntervalType) => {
  const wageFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
  }).format(wage);

  switch (wageInterval) {
    case "hourly":
      return `${wageFormatter} / hr`;
    case "monthly":
      return `${wageFormatter} / month`;
    case "yearly":
      return `${wageFormatter} / year`;

    default:
      throw new Error(`Invalid wage interval: ${wageInterval satisfies never}`);
  }
};

export const formatJobListingLocation = (city: string | null) => {
  if (!city) return "";

  const locationParts = [];
  if (city != null) locationParts.push(city);

  return locationParts.join(", ");
};
