import OrgRequestsTable from "@/features/admin/components/org-requests-table";
import { PageHeader } from "@/components/shared/page-header";

export default function OrganizationRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Organization Requests"
        description="Review and approve requests from employers to create organizations"
      />
      <OrgRequestsTable searchParams={searchParams} />
    </div>
  );
}
