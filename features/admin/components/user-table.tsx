import { Suspense } from "react";
import { getAllUsers } from "@/features/users/db/user-db";
import Loading from "@/components/shared/loading";
import { UserTableClient } from "./_user-table-client";

export default function UserTable({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent searchParams={searchParams} />
    </Suspense>
  );
}

const SuspendedComponent = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = getNumberParam(resolvedSearchParams.page, 1);
  const pageSize = getNumberParam(resolvedSearchParams.pageSize, 10);

  const result = await getAllUsers(page, pageSize);

  if (!result.success) {
    return (
      <div className="text-muted-foreground p-4 text-center animate-pulse">
        Failed to load users
      </div>
    );
  }
  const users = result.data;

  if (!result.pagination) {
    return (
      <div className="text-muted-foreground p-4 text-center animate-pulse">
        Failed to load pagination
      </div>
    );
  }
  const pagination = result.pagination;

  if (users.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center animate-pulse">
        No users found
      </div>
    );
  }

  return <UserTableClient users={users} pagination={pagination} />;
};

const getNumberParam = (
  value: string | string[] | undefined,
  fallback: number,
) => {
  const stringValue = Array.isArray(value) ? value[0] : value;
  if (!stringValue) return fallback;

  const parsed = Number.parseInt(stringValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
