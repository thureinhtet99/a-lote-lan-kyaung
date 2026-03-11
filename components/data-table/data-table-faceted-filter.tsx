import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DataTableFacetedTablePropsType } from "@/types/index.type";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

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
          {title}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[180px] p-0">
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
                        "flex size-3 items-center justify-center p-2 rounded border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      <CheckIcon className="text-primary-foreground size-4" />
                    </div>
                    <span>{opt.label}</span>
                    {facets?.get(opt.value) && (
                      <span className="ml-auto">{facets?.get(opt.value)}</span>
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
