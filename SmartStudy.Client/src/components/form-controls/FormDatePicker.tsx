import type { FieldValues } from "react-hook-form";
import { DatePicker } from "@/components/ui/custom/date-picker";
import type { BaseFormControlProps } from "./type";
import { BaseFormField } from "./BaseFormField";

interface FormDatePickerProps<
  T extends FieldValues,
> extends BaseFormControlProps<T> {
  label: string;
  placeholder?: string;
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
}: FormDatePickerProps<T>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      label={label}
      render={(field) => (
        <DatePicker
          value={field.value}
          onChange={field.onChange}
          placeholder={placeholder}
          className={className}
        />
      )}
    />
  );
}
