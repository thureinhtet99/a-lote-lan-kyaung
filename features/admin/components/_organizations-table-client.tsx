"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVisiblePages } from "../lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { OrganizationType, PaginationType } from "@/types/index.type";

type Props = Omit<OrganizationType, "metadata"> & {
  memberCount: number;
};

export function OrganizationsTableClient({
  organizations,
  pagination,
  initialQuery,
}: {
  organizations: Props[];
  pagination: PaginationType;
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const visiblePages = getVisiblePages(pagination.page, pagination.totalPages);
  const emptyRowCount = Math.max(0, pagination.pageSize - organizations.length);

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    params.set("pageSize", String(pagination.pageSize));
    return `${pathname}?${params.toString()}`;
  };

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    params.set("page", "1");
    params.set("pageSize", String(pagination.pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.set("page", "1");
    params.set("pageSize", String(pagination.pageSize));
    setSearchQuery("");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by organization or slug"
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      {organizations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          {initialQuery
            ? `No organizations match "${initialQuery}"`
            : "No organizations found"}
        </div>
      ) : (
        <>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg">
                        <AvatarImage
                          src={org.logo ?? undefined}
                          alt={org.name}
                        />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          {org.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{org.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    @{org.slug}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {Number(org.memberCount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {Array.from({ length: emptyRowCount }, (_, index) => (
                <TableRow key={`empty-row-${index}`} aria-hidden="true">
                  <TableCell colSpan={4} className="h-[49px]" />
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <CustomPagination
            pagination={pagination}
            createPageUrl={createPageUrl}
            visiblePages={visiblePages}
          />
        </>
      )}
    </>
  );
}
