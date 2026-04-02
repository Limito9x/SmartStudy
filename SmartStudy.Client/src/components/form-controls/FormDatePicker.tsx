import "react-datepicker/dist/react-datepicker.css";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DatePicker from "../ui/custom/date-picker";

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
  minDate,
  maxDate,
}: FormDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <DatePicker
            date={field.value}
            setDate={field.onChange}
            minDate={minDate}
            maxDate={maxDate}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
