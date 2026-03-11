import type { FieldValues } from "react-hook-form";
import { Input } from "../ui/input";
import { NumberInput } from "../ui/custom/number-input";
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
      render={(field) =>
        type === "number" ? (
          <NumberInput
            placeholder={placeholder}
            {...field}
            // onChange đã được xử lý trong NumberInput để đảm bảo luôn trả về number hoặc null
          />
        ) : (
          <Input
            placeholder={placeholder}
            type={type}
            {...field}
            onChange={(e) => {
              let value = e.target.value;
              field.onChange(value);
            }}
          />
        )
      }
    />
  );
}
