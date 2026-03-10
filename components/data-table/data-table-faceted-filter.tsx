import { DataTableFacetedTablePropsType } from "@/types/index.type";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function DataTableFacetedFilter<TData, TValue, OValue>({
  column,
  title,
  disabled,
  options,
}: DataTableFacetedTablePropsType<TData, TValue, OValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as OValue[]);

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer" asChild>
        <Button disabled={disabled} variant="outline" size="sm">
          {selectedValues.size > 0 && (
            <Badge variant="secondary" size="sm">
              {selectedValues.size}
            </Badge>
          )}
          {title}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[200px] p-0">
        <Command className="max-w-sm rounded-lg border">
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedValues.has(opt.value);

                return (
                  <CommandItem
                    className="text-sm"
                    key={opt.key}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(opt.value);
                      } else {
                        selectedValues.add(opt.value);
                      }

                      const filteredValues = [...selectedValues];
                      column?.setFilterValue(
                        filteredValues.length > 0 ? filteredValues : undefined,
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-3 items-center justify-center p-2 rounded",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      <CheckIcon className="text-primary-foreground size-4" />
                    </div>
                    <span>{opt.label}</span>
                    {facets?.get(opt.value) && (
                      <Badge
                        size="sm"
                        variant="outline"
                        className="ml-auto text-primary"
                      >
                        {facets?.get(opt.value)}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center text-destructive"
                  >
                    Clear
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
