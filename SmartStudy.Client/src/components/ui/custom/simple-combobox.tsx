import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  notFoundContent?: (inputText: string) => React.ReactNode;
  onSearchChange?: (search: string) => void;
}

export function SimpleCombobox({
  value,
  onValueChange,
  options,
  placeholder = "Chọn...",
  emptyText = "Không có kết quả",
  disabled,
  notFoundContent,
  onSearchChange,
}: SimpleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {value ? (
            options.find((o) => o.value === value)?.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Tìm kiếm..."
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              onSearchChange?.(val);
            }}
          />
          <CommandList>
            <CommandEmpty>
              {notFoundContent ? notFoundContent(search) : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(val) => {
                    onValueChange(val);
                    setOpen(false);
                  }}
                  keywords={[option.label]}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
