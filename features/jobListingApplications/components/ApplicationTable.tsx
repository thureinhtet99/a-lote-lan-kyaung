"use client";

import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSortableColumnHeader } from "@/components/data-table/DataTableSortableColumnHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApplicationType } from "@/types/application.type";
import { ColumnDef } from "@tanstack/react-table";
import sortApplicationByStatus from "../lib/utils";
import { applicationStatus, ApplicationStatusType } from "@/drizzle/schema";
import { useOptimistic, useTransition } from "react";
import StatusIcon from "./StatusIcon";
import { formatApplicationStatus } from "../lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { updateJobListingApplicationStatus } from "../actions/actions";
import { toast } from "sonner";

export default function ApplicationTable({
  applications,
}: {
  applications: ApplicationType[];
}) {
  return <DataTable columns={getColumns(true, true)} data={applications} />;
}

const getColumns = (
  canUpdateRating: boolean,
  canUpdateStatus: boolean
): ColumnDef<ApplicationType>[] => {
  return [
    {
      accessorFn: (row) => row.user.first_name,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original.user;
        const nameInitial = user.first_name
          .split(" ")
          .slice(0, 2)
          .map((name) => name.charAt(0).toUpperCase())
          .join("");

        return (
          <div className="flex items-center gap-2">
            <Avatar className="rounded-full size-6">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.first_name + user.last_name}
              />
              <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xs">
                {nameInitial}
              </AvatarFallback>
            </Avatar>
            <span>
              {user.first_name} {user.last_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Status" />
      ),
      sortingFn: ({ original: a }, { original: b }) => {
        return sortApplicationByStatus(a.status, b.status);
      },
      filterFn: ({ original }, _, value) => {
        return value.includes(original.status);
      },
      cell: ({ row }) => (
        <StatusCell
          canUpdate={canUpdateStatus}
          status={row.original.status}
          jobListingId={row.original.jobListingId}
          userId={row.original.user.id}
        />
      ),
    },
  ];
};

const StatusCell = ({
  canUpdate,
  status,
  jobListingId,
  userId,
}: {
  canUpdate: boolean;
  status: ApplicationStatusType;
  jobListingId: string;
  userId: string;
}) => {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) return <StatusDetail status={optimisticStatus} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <StatusDetail status={optimisticStatus} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {applicationStatus.toSorted(sortApplicationByStatus).map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => {
              startTransition(async () => {
                setOptimisticStatus(status);
                const response = await updateJobListingApplicationStatus(
                  { jobListingId, userId },
                  status
                );

                if (response?.error) toast.error(response.message);
              });
            }}
          >
            <StatusDetail status={status} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StatusDetail = ({ status }: { status: ApplicationStatusType }) => {
  return (
    <div className="flex items-center gap-2">
      <StatusIcon status={status} className="size-5 text-inherit" />
      <div>{formatApplicationStatus(status)}</div>
    </div>
  );
};
