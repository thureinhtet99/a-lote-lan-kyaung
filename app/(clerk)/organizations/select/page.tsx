import { SearchParamsType } from "@/types";
import { OrganizationList } from "@clerk/nextjs";
import { Suspense } from "react";



const SuspendedPage = async ({ searchParams }: SearchParamsType) => {
  const { redirect } = await searchParams;  
  const redirectedURL = redirect ?? "/employer";

  return (
    <OrganizationList
      hidePersonal
      hideSlug
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectedURL}
      afterCreateOrganizationUrl={redirectedURL}
    />
  );
};

export default async function OrganizationSelectPage(
  searchParams: SearchParamsType
) {
  return (
    <Suspense>
      <SuspendedPage {...searchParams} />
    </Suspense>
  );
}
