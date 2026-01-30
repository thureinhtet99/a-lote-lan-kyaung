"use client";

import { DataTable } from "@/components/data-table/DataTable";
import { DataTableSortableColumnHeader } from "@/components/data-table/DataTableSortableColumnHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import sortApplicationByStatus from "../lib/utils";
import { applicationStatus, ApplicationStatusType } from "@/drizzle/schema";
import { ReactNode, useOptimistic, useState, useTransition } from "react";
import StatusIcon from "./StatusIcon";
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
import {
  updateJobListingApplicationRating,
  updateJobListingApplicationStatus,
} from "../actions/actions";
import { toast } from "sonner";
import RatingIcon from "./RatingIcon";
import { RATING_OPTIONS } from "../data/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Table } from "@tanstack/react-table";
import { JobListingApplicationType } from "@/types/index.type";
import DataTableFacetedFilter from "@/components/data-table/data-table-faceted-filter";

export default function ApplicationTable({
  applications,
  canUpdateRating,
  canUpdateStatus,
  noResultMessage = "No applications",
  disableToolbar = false,
}: {
  applications: JobListingApplicationType[];
  canUpdateRating: boolean;
  canUpdateStatus: boolean;
  noResultMessage?: ReactNode;
  disableToolbar?: boolean;
}) {
  return (
    <DataTable
      columns={getColumns(canUpdateRating, canUpdateStatus)}
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
  const hiddenRow = table.getCoreRowModel().rows.length - table.getRowCount();

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
      {table.getColumn("rating") && (
        <DataTableFacetedFilter
          column={table.getColumn("rating")}
          title="Rating"
          disabled={disabled}
          options={RATING_OPTIONS.map((rating, index) => ({
            label: <RatingIcon rating={rating} />,
            value: rating,
            key: index,
          }))}
        />
      )}
      {hiddenRow > 0 && (
        <div className="text-sm text-muted-foreground ml-2">
          {hiddenRow} {hiddenRow > 1 ? "rows" : "row"} hidden
        </div>
      )}
    </div>
  );
}

const getColumns = (
  canUpdateRating: boolean,
  canUpdateStatus: boolean,
): ColumnDef<JobListingApplicationType>[] => {
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

    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Rating" />
      ),
      filterFn: ({ original }, _, value) => {
        return value.includes(original.rating);
      },
      cell: ({ row }) => (
        <RatingCell
          canUpdate={canUpdateRating}
          rating={row.original.rating}
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
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
            userName={`${jobListing.user.first_name}${jobListing.user.last_name}`}
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
                  status,
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

const RatingCell = ({
  canUpdate,
  rating,
  jobListingId,
  userId,
}: {
  canUpdate: boolean;
  rating: number | null;
  jobListingId: string;
  userId: string;
}) => {
  const [optimisticRating, setOptimisticRating] = useOptimistic(rating);
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) return <RatingIcon rating={optimisticRating} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <RatingIcon rating={optimisticRating} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {RATING_OPTIONS.map((rating) => (
          <DropdownMenuItem
            key={rating}
            onClick={() => {
              startTransition(async () => {
                setOptimisticRating(rating);
                const response = await updateJobListingApplicationRating(
                  { jobListingId, userId },
                  rating,
                );

                if (response?.error) toast.error(response.message);
              });
            }}
          >
            <RatingIcon rating={rating} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {resumeMarkDown != null || resumeUrl != null ? (
            <DropdownMenuItem onClick={() => setOpenModal("resume")}>
              View Resume
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Resume
            </DropdownMenuLabel>
          )}

          {coverLetterMarkDown ? (
            <DropdownMenuItem onClick={() => setOpenModal("cover-letter")}>
              View Cover Letter
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Cover Letter
            </DropdownMenuLabel>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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

const StatusDetail = ({ status }: { status: ApplicationStatusType }) => {
  return (
    <div className="flex items-center gap-2">
      <StatusIcon status={status} className="size-5 text-inherit" />
      <div>{formatApplicationStatus(status)}</div>
    </div>
  );
};
