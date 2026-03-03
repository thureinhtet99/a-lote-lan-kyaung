import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationType } from "@/types/index.type";

export default function CustomPagination({
  pagination,
  createPageUrl,
  visiblePages,
}: {
  pagination: PaginationType;
  createPageUrl: (targetPage: number) => string;
  visiblePages: (number | "ellipsis")[];
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground sm:order-1">
        Showing page {pagination.page} of {pagination.totalPages} (
        {pagination.totalItems} total)
      </p>
      <Pagination className="order-3 mx-0 w-full justify-start overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:pb-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createPageUrl(Math.max(1, pagination.page - 1))}
              aria-disabled={pagination.page <= 1}
              tabIndex={pagination.page <= 1 ? -1 : undefined}
              className={
                pagination.page <= 1
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>

          {visiblePages.map((page, index) => (
            <PaginationItem key={`org-page-${page}-${index}`}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={createPageUrl(page)}
                  isActive={page === pagination.page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={createPageUrl(
                Math.min(pagination.totalPages, pagination.page + 1),
              )}
              aria-disabled={pagination.page >= pagination.totalPages}
              tabIndex={
                pagination.page >= pagination.totalPages ? -1 : undefined
              }
              className={
                pagination.page >= pagination.totalPages
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
