// components/forms/base/FormDatePicker.tsx
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
registerLocale("vi", vi);
import { IMaskInput } from "react-imask";

interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  isClearable?: boolean;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Chọn ngày",
  minDate,
  maxDate,
  isClearable = true,
}: FormDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <DatePicker
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date?.toISOString() ?? null)}
            dateFormat="dd/MM/yyyy"
            strictParsing={false}
            placeholderText={placeholder}
            minDate={minDate}
            maxDate={maxDate}
            isClearable={isClearable}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            locale="vi"
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring ${fieldState.error ? "border-destructive" : ""}`}
            wrapperClassName="w-full"
            customInput={
              <IMaskInput
                mask="00/00/0000"
                placeholder="dd/MM/yyyy"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm..."
              />
            }
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
