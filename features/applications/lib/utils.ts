import { ApplicationStatusType } from "@/drizzle/schema";

export default function sortApplicationByStatus(
  a: ApplicationStatusType,
  b: ApplicationStatusType
): number {
  return APPLICATION_STATUS_SORT_ORDER[a] - APPLICATION_STATUS_SORT_ORDER[b];
}

const APPLICATION_STATUS_SORT_ORDER: Record<ApplicationStatusType, number> = {
  applied: 0,
  interested: 1,
  interviewed: 2,
  hired: 3,
  denied: 4,
};
