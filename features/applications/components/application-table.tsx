"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import sortApplicationByStatus from "../lib/utils";
import { applicationStatus, ApplicationStatusType } from "@/drizzle/schema";
import { ReactNode, useOptimistic, useState, useTransition } from "react";
import { formatApplicationStatus } from "../lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Table } from "@tanstack/react-table";
import { ApplicationType } from "@/types/index.type";
import DataTableFacetedFilter from "@/components/data-table/data-table-faceted-filter";
import { DataTableSortableColumnHeader } from "@/components/data-table/data-table-sortable-column-header";
import StatusIcon from "./status-icon";
import { updateApplicationStatus } from "../db/application-db";

export default function ApplicationTable({
  applications,
  canUpdateStatus,
  noResultMessage = "No applications",
  disableToolbar = false,
}: {
  applications: ApplicationType[];
  canUpdateStatus: boolean;
  noResultMessage?: ReactNode;
  disableToolbar?: boolean;
}) {
  return (
    <DataTable
      columns={getColumns(canUpdateStatus)}
      data={applications}
      noResultMessage={noResultMessage}
      ToolbarComponent={disableToolbar ? DisabledToolbar : Toolbar}
      initialFilters={[
        {
          id: "status",
          value: applicationStatus.filter((status) => status !== "denied"),
        },
      ]}
    />
  );
}

function DisabledToolbar<T>({ table }: { table: Table<T> }) {
  return <Toolbar table={table} disabled />;
}

function Toolbar<T>({
  table,
  disabled,
}: {
  table: Table<T>;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {table.getColumn("status") && (
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Status"
          disabled={disabled}
          options={applicationStatus
            .toSorted(sortApplicationByStatus)
            .map((status) => ({
              label: <StatusDetail status={status} />,
              value: status,
              key: status,
            }))}
        />
      )}
    </div>
  );
}

const getColumns = (canUpdateStatus: boolean): ColumnDef<ApplicationType>[] => {
  return [
    {
      accessorFn: (row) => row.user.name,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original.user;
        const nameInitial = user.name
          .split(" ")
          .slice(0, 2)
          .map((name) => name.charAt(0).toUpperCase())
          .join("");

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
                {nameInitial}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
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

    {
      accessorKey: "createdAt",
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Applied On" />
      ),
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </div>
      ),
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const jobListing = row.original;
        const resume = jobListing.user.resume;

        return (
          <ActionCell
            coverLetterMarkDown={jobListing.coverLetterMarkDown}
            resumeMarkDown={resume?.markdownSummary}
            resumeUrl={resume?.resumeFileUrl}
            userName={`${jobListing.user.name}`}
          />
        );
      },
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
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="min-w-36 cursor-pointer border" asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "-ml-3 h-8",
              isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            <StatusDetail status={optimisticStatus} />
            <ChevronDownIcon className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {applicationStatus.toSorted(sortApplicationByStatus).map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => {
                startTransition(async () => {
                  setOptimisticStatus(status);
                  const response = await updateApplicationStatus(
                    { jobListingId, userId },
                    status,
                  );

                  if (response.success) toast.success(response.message);
                  else toast.error(response.message);
                });
              }}
            >
              <StatusDetail status={status} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ActionCell = ({
  coverLetterMarkDown,
  resumeMarkDown,
  resumeUrl,
  userName,
}: {
  coverLetterMarkDown: ReactNode | null;
  resumeMarkDown: ReactNode | null;
  resumeUrl: string | null | undefined;
  userName: string;
}) => {
  const [openModal, setOpenModal] = useState<"resume" | "cover-letter" | null>(
    null,
  );

  return (
    <>
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {resumeMarkDown != null || resumeUrl != null ? (
              <DropdownMenuItem onClick={() => setOpenModal("resume")}>
                View resume
              </DropdownMenuItem>
            ) : (
              <DropdownMenuLabel className="text-muted-foreground">
                No resume
              </DropdownMenuLabel>
            )}

            {coverLetterMarkDown ? (
              <DropdownMenuItem onClick={() => setOpenModal("cover-letter")}>
                View cover letter
              </DropdownMenuItem>
            ) : (
              <DropdownMenuLabel className="text-muted-foreground">
                No cover letter
              </DropdownMenuLabel>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {coverLetterMarkDown && (
        <Dialog
          open={openModal === "cover-letter"}
          onOpenChange={(open) => setOpenModal(open ? "cover-letter" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Cover Letter</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{coverLetterMarkDown}</div>
          </DialogContent>
        </Dialog>
      )}
      {resumeMarkDown ||
        (resumeUrl && (
          <Dialog
            open={openModal === "resume"}
            onOpenChange={(open) => setOpenModal(open ? "resume" : null)}
          >
            <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Resume</DialogTitle>
                <DialogDescription>{userName}</DialogDescription>
                {resumeUrl && (
                  <Button asChild className="self-start">
                    <Link
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Original Resume
                    </Link>
                  </Button>
                )}
                <DialogDescription>
                  This is AI-generated summary of the applicant&apos;s resume
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">{resumeMarkDown}</div>
            </DialogContent>
          </Dialog>
        ))}
    </>
  );
};

const StatusDetail = ({ status }: { status: ApplicationStatusType }) => (
  <div className="flex items-center gap-2">
    <StatusIcon status={status} className="size-4" />
    <span className="text-sm">{formatApplicationStatus(status)}</span>
  </div>
);
