import type { BaseFormControlProps } from "./type";
import {
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form";

interface BaseFormFieldProps<
  T extends FieldValues,
> extends BaseFormControlProps<T> {
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
}

export function BaseFormField<T extends FieldValues>({
  control,
  name,
  label,
  render,
}: BaseFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{render(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
