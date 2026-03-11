import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../input";
import {IMaskInput, IMask} from "react-imask";

const VI_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  startDate?: Date;
  endDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  id = "date-picker",
  placeholder = "DD/MM/YYYY",
  className,
  startDate,
  endDate,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy", { locale: vi }));
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/\D/g, "");
    if (val.length >= 3 && val.length <= 4) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    } else if (val.length >= 5) {
      val = val.slice(0, 2) + "/" + val.slice(2, 4) + "/" + val.slice(4, 8);
    }
    setInputValue(val);
    if (val.length === 10) {
      const parsedDate = parse(val, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      }
    } else if (val.length === 0) {
      onChange(undefined);
    }
  };

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <div className="relative">
          <IMaskInput
            id={id}
            // 1. Cấu hình Mask chuẩn cho Ngày tháng
            mask="d/m/Y"
            blocks={{
              d: { mask: IMask.MaskedRange, from: 1, to: 31, maxLength: 2 },
              m: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2 },
              Y: {
                mask: IMask.MaskedRange,
                from: 1900,
                to: 2099,
                maxLength: 4,
              },
            }}
            // 2. Tính năng ăn tiền: autofix="pad". Gõ '5' nó tự biến thành '05/' và nhảy sang tháng
            autofix="pad"
            placeholder={placeholder}
            value={inputValue}
            unmask={false} // Lấy nguyên chuỗi có cả dấu '/'
            onAccept={(value) => {
              setInputValue(value);

              // Khi gõ đủ 10 ký tự (DD/MM/YYYY) thì mới gọi onChange để update
              if (value.length === 10) {
                const parsedDate = parse(value, "dd/MM/yyyy", new Date());
                if (isValid(parsedDate)) {
                  onChange(parsedDate);
                }
              } else if (value.length === 0) {
                onChange(undefined);
              }
            }}
            // 3. Ép class của Shadcn Input vào để nó đẹp
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10",
            )}
          />
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setIsPopoverOpen(false);
            }}
            locale={vi}
            captionLayout="dropdown"
            startMonth={startDate || new Date(2000, 0)}
            endMonth={endDate || new Date(2040, 11)}
            formatters={{
              formatMonthDropdown: (month) => VI_MONTHS[month.getMonth()],
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
