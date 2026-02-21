import { EmployerRequestsTable } from "@/features/employer-requests/components/employer-requests-table";

export default function EmployerRequestsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employer Requests</h1>
        <p className="text-muted-foreground">
          Review and manage employer role requests
        </p>
      </div>
      <EmployerRequestsTable />
    </div>
  );
}
