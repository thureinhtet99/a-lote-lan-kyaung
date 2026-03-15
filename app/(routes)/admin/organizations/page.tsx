import OrganizationsTable from "@/features/admin/components/organizations-table";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Organizations"
        description="All approved organizations on the platform"
      />
      <OrganizationsTable searchParams={searchParams} />
    </div>
  );
}
