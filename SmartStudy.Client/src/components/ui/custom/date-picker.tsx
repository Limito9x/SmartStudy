import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field } from "../field";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  id = "date-picker",
  placeholder,
  className,
}: DatePickerProps) {
  return (
    <Field className={cn("w-max", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" id={id} className="">
            <CalendarIcon />
            {value ? (
              format(value, "dd/MM/yyyy", { locale: vi })
            ) : (
              <span>{placeholder || "Chọn ngày"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="">
          <Calendar
            mode="single"
            required={true}
            selected={value}
            onSelect={onChange}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
