import { ApplicationStatusType } from "@/drizzle/schema";

export default function sortApplicationByStatus(
  a: ApplicationStatusType,
  b: ApplicationStatusType,
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

export const getResumeFileName = (url: string) =>
  decodeURIComponent(url.split("/").pop() ?? "resume.pdf");

export const formatUploadedAt = (value: string | null) => {
  if (!value) return "date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
};
