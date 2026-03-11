import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FormDatePickerProps {
  control: Control<any>;
  name: string;
  label: string;
  startDate?: Date;
  endDate?: Date;
}

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

export function FormDatePicker({ control, name, label, startDate, endDate }: FormDatePickerProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="mb-1">{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? (
                    // ÉP CỨNG HIỂN THỊ DD/MM/YYYY CHO USER NHÌN
                    format(new Date(field.value), "dd/MM/yyyy")
                  ) : (
                    <span>Chọn ngày...</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                // Đọc chuỗi từ form biến thành Object Date cho lịch nó hiểu
                selected={field.value ? new Date(field.value) : undefined}
                // Khi user chọn lịch, biến Object Date thành chuỗi YYYY-MM-DD ném về form
                onSelect={(date) =>
                  field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                }
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
