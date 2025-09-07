import { PlanFeatureType } from "@/types";
import { auth } from "@clerk/nextjs/server";



export async function hasPlanFeature(feature: PlanFeatureType) {
  const { has } = await auth();
  return has({ feature });
}

