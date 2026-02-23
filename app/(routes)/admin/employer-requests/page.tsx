import EmployerRequestsTable from "../../../../features/admin/components/employer-requests-table";

export default function EmployerRequestsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold">Employer Requests</h1>
        <p className="text-muted-foreground">
          Review and manage employer role requests
        </p>
      </div>
      <EmployerRequestsTable />
    </div>
  );
}
