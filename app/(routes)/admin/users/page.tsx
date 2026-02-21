import { UsersTable } from "@/features/users/components/users-table";

export default function UsersPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and permissions
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
