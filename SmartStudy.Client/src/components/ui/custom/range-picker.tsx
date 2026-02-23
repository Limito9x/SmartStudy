import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

interface RangePickerProps {
  value?: DateRange;
  onChange: (nextValue: DateRange | undefined) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function RangePicker({
  value,
  onChange,
  id = "date-picker-range",
  label = "Chọn khoảng thời gian",
  placeholder = "Chọn một khoảng thời gian",
  className,
}: RangePickerProps) {
  return (
    <Field className={className ?? "mx-auto w-60"}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={id}
            className="justify-start gap-2 px-2.5 font-normal"
          >
            <CalendarIcon />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: vi })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: vi })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
