import { PlanFeatureType } from "@/types/plan-feature.type";
import { auth } from "@clerk/nextjs/server";

export async function hasPlanFeature(feature: PlanFeatureType) {
  const { has } = await auth();
  return has({ feature });
}
