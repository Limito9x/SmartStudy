import type { Control, FieldValues, Path } from "react-hook-form";

export interface BaseFormControlProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
}
