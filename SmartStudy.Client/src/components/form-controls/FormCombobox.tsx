import type { FieldValues } from "react-hook-form";
import type { ReactNode } from "react";
import { BaseFormField } from "./BaseFormField";
import type { BaseFormControlProps } from "./type";
import { SimpleCombobox } from "../ui/custom/simple-combobox";

interface FormComboboxProps<
  TFieldValues extends FieldValues,
  TOption,
> extends BaseFormControlProps<TFieldValues> {
  options: TOption[];
  getOptionLabel: (option: TOption) => string;
  getOptionValue: (option: TOption) => string;
  emptyText?: string;
  disabled?: boolean;
  valueAsNumber?: boolean;
  renderOption?: (option: TOption) => ReactNode;
  notFoundContent?: (inputText: string) => ReactNode;
  onSearchChange?: (search: string) => void;
}

export function FormCombobox<TFieldValues extends FieldValues, TOption>({
  control,
  name,
  label,
  placeholder,
  options = [],
  getOptionLabel,
  getOptionValue,
  emptyText,
  disabled = false,
  valueAsNumber = false,
  renderOption,
  notFoundContent,
  onSearchChange,
}: FormComboboxProps<TFieldValues, TOption>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      label={label}
      render={(field) => {
        return (
          <SimpleCombobox
            value={field.value?.toString()}
            onValueChange={(val) =>
              field.onChange(valueAsNumber ? Number(val) : val)
            }
            options={options.map((o) => ({
              label: getOptionLabel(o),
              value: getOptionValue(o),
            }))}
            placeholder={placeholder}
            emptyText={emptyText}
            disabled={disabled}
            notFoundContent={notFoundContent}
            onSearchChange={onSearchChange}
          />
        );
      }}
    />
  );
}
