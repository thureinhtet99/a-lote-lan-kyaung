import EmployerRequestsTable from "@/features/admin/components/employer-requests-table";
import { PageHeader } from "@/components/shared/page-header";

export default function EmployerRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Employer Requests"
        description="Review and manage employer role requests"
      />
      <EmployerRequestsTable searchParams={searchParams} />
    </div>
  );
}
