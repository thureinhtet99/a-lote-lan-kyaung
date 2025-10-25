import { SearchParamsType } from "@/types/params.type";
import { OrganizationList } from "@clerk/nextjs";
import { Suspense } from "react";

export default async function OrganizationSelectPage(
  searchParams: SearchParamsType
) {
  return (
    <Suspense>
      <SuspendedComponent {...searchParams} />
    </Suspense>
  );
}

const SuspendedComponent = async ({ searchParams }: SearchParamsType) => {
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
