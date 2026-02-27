import type { FieldValues } from "react-hook-form";
import { Input } from "../ui/input";
import type React from "react";
import type { BaseFormControlProps } from "./type";
import { BaseFormField } from "./BaseFormField";

interface FormInputProps<
  T extends FieldValues,
> extends BaseFormControlProps<T> {
  type?: React.HTMLInputTypeAttribute; // Thêm type nếu cần thiết, mặc định là "text"
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormInputProps<T>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      label={label}
      render={(field) => (
        <Input placeholder={placeholder} type={type} {...field} />
      )}
    />
  );
}
