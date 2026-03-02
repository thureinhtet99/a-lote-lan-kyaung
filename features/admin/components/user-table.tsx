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

  return (
    <UserTableClient
      users={users}
      pagination={pagination}
      initialQuery={query}
    />
  );
};
