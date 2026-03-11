"use client";

import { DataTable } from "@/components/data-table/data-table";
import DataTableFacetedFilter from "@/components/data-table/data-table-faceted-filter";
import { DataTableSortableColumnHeader } from "@/components/data-table/data-table-sortable-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applicationStatus, ApplicationStatusType } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { ApplicationType } from "@/types/index.type";
import { ColumnDef, Table } from "@tanstack/react-table";
import { ChevronDownIcon, FileTextIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateApplicationStatus } from "../db/application-db";
import { formatApplicationStatus } from "../lib/formatters";
import sortApplicationByStatus from "../lib/utils";
import StatusIcon from "./status-icon";

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
          title="Filter"
          disabled={disabled}
          options={applicationStatus
            .toSorted(sortApplicationByStatus)
            .map((status) => ({
              label: (
                <span className="text-sm">
                  {formatApplicationStatus(status)}
                </span>
              ),
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
            <Avatar className="size-10">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg uppercase">
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
        <DataTableSortableColumnHeader column={column} title="Applied Date" />
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
  const hasResumeUrl = resumeUrl != null;
  const hasCoverLetter = coverLetterMarkDown != null;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open resume"
          onClick={() => setOpenModal("resume")}
          disabled={!hasResumeUrl}
          className={cn(
            hasResumeUrl
              ? "cursor-pointer"
              : "cursor-not-allowed text-muted-foreground",
          )}
        >
          <FileTextIcon className="size-4" />
          <span className="sr-only">Resume</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open cover letter"
          onClick={() => setOpenModal("cover-letter")}
          disabled={!hasCoverLetter}
          className={cn(
            hasCoverLetter
              ? "cursor-pointer"
              : "cursor-not-allowed text-muted-foreground",
          )}
        >
          <MailIcon className="size-4" />
          <span className="sr-only">Cover letter</span>
        </Button>
      </div>

      {hasCoverLetter && (
        <Dialog
          open={openModal === "cover-letter"}
          onOpenChange={(open) => setOpenModal(open ? "cover-letter" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">
                Cover Letter
              </DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              {coverLetterMarkDown}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {hasResumeUrl && (
        <Dialog
          open={openModal === "resume"}
          onOpenChange={(open) => setOpenModal(open ? "resume" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="space-y-2">
              <DialogTitle>Resume</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
              {resumeUrl && (
                <Button asChild size="sm" className="self-start">
                  <Link
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Resume
                  </Link>
                </Button>
              )}
              {resumeMarkDown != null && (
                <DialogDescription>
                  AI-generated summary of the applicant&apos;s resume
                </DialogDescription>
              )}
            </DialogHeader>
            {resumeMarkDown != null ? (
              <div className="flex-1 overflow-y-auto px-1">
                {resumeMarkDown}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-md px-4 text-sm text-muted-foreground">
                No summary available. View resume for full details.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const StatusDetail = ({ status }: { status: ApplicationStatusType }) => (
  <div className="flex items-center gap-2">
    <StatusIcon status={status} className="size-4 focus:text-white" />
    <span className="text-sm">{formatApplicationStatus(status)}</span>
  </div>
);
