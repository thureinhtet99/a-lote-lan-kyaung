import { UsersTable } from "@/features/users/components/users-table";

export default function UsersPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
