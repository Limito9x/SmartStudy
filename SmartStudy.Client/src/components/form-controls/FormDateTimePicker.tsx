import { BaseFormField } from "./BaseFormField";
import DateTimePicker from "../ui/custom/date-time-picker";
import type { BaseFormControlProps } from "./type";
import type { FieldValues } from "react-hook-form";

interface FormDateTimePickerProps<
  T extends FieldValues,
> extends BaseFormControlProps<T> {
  minDate?: Date;
  maxDate?: Date;
}

export function FormDateTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  minDate,
  maxDate,
}: FormDateTimePickerProps<T>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      label={label}
      render={(field) => (
        <DateTimePicker
          value={field.value}
          onChange={(date) => field.onChange(date)}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    />
  );
}
