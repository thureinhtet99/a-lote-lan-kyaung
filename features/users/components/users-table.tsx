import { Suspense } from "react";
import { getAllUsers } from "@/features/users/db/user-db";
import { unstable_cache } from "next/cache";
import { tag } from "@/lib/utils";
import Loading from "@/components/shared/loading";
import { UsersTableClient } from "./users-table-client";

export type UserProps = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
};

export function UsersTable() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const cachedData = unstable_cache(async () => getAllUsers(), [tag("users")], {
    tags: [tag("users")],
  });

  const result = await cachedData();

  if (!result.success) {
    return (
      <div className="text-muted-foreground p-4 text-center animate-pulse">
        Failed to load users
      </div>
    );
  }

  const users = result.data;

  if (users.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        No users found
      </div>
    );
  }

  return <UsersTableClient users={users} />;
};
