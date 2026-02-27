import type { FieldValues } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { BaseFormControlProps } from "./type";
import { BaseFormField } from "./BaseFormField";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps<
  T extends FieldValues,
> extends BaseFormControlProps<T> {
  options?: Option[];
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options = [],
}: FormSelectProps<T>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      label={label}
      render={(field) => (
        <Select
          value={field.value?.toString()}
          onValueChange={(val) => field.onChange(Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
