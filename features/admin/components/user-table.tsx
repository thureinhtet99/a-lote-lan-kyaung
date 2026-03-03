import { Suspense } from "react";
import { getAllUsers } from "@/features/users/db/user-db";
import Loading from "@/components/shared/loading";
import { UserTableClient } from "./_user-table-client";
import { getNumberParam, getStringParam } from "../lib/utils";

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
  const query = getStringParam(resolvedSearchParams.q, "");

  const result = await getAllUsers(page, pageSize, query);

  if (!result.success) {
    return (
      <div className="text-destructive p-4 text-center animate-pulse">
        Failed to load users
      </div>
    );
  }
  const users = result.data;
  const pagination = result.pagination;

  return (
    <UserTableClient
      users={users}
      pagination={
        pagination ?? { page: 1, pageSize: 10, totalUsers: 0, totalPages: 0 }
      }
      initialQuery={query}
    />
  );
};
