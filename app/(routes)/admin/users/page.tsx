import UserTable from "@/features/admin/components/user-table";

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and permissions
        </p>
      </div>
      <UserTable searchParams={searchParams} />
    </div>
  );
}
