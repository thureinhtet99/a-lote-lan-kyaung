import { APP_ROUTES } from "@/lib/appConfig";
import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

export default function PricingTable() {
  return (
    <ClerkPricingTable
      forOrganizations
      newSubscriptionRedirectUrl={APP_ROUTES.EMPLOYER.PRICING}
    />
  );
}
