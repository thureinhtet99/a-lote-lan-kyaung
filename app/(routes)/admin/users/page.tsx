import UserTable from "@/features/admin/components/user-table";
import { PageHeader } from "@/components/shared/page-header";

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions"
      />
      <UserTable searchParams={searchParams} />
    </div>
  );
}
