import { differenceInDays } from "date-fns";
import { connection } from "next/server";

export const daySinceJoined = async (createdAt: Date) => {
  await connection();

  const daySincePosted = differenceInDays(createdAt, Date.now());
  if (daySincePosted === 0) {
    return "New";
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daySincePosted, "days");
};
