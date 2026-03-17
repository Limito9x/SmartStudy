import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type React from "react";
import type { BaseFormControlProps } from "./type";
import { BaseFormField } from "./BaseFormField";

interface FormInputProps<
  T extends FieldValues,
> extends BaseFormControlProps<T> {
  type?: React.HTMLInputTypeAttribute; // Thêm type nếu cần thiết, mặc định là "text"
}

// 1. Bảng màu chuẩn Academic Pastel
const COURSE_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", 
  "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"
];

export function FormColorPicker<T extends FieldValues>({
  control,
  name,
  label,
}: FormInputProps<T>) {
  return (
    <BaseFormField
      control={control}
      name={name}
      label={label}
      render={(field) => (
        <div className="flex flex-wrap gap-3 pt-2">
          {COURSE_COLORS.map((colorHex) => {
            const isSelected = field.value === colorHex;
            return (
              <button
                type="button"
                key={colorHex}
                // Bắn mã hex lên cho React Hook Form quản lý
                onClick={() => field.onChange(colorHex)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  isSelected
                    ? "ring-2 ring-offset-2 ring-gray-800 scale-110 shadow-md"
                    : "hover:scale-110 ring-1 ring-black/10 shadow-sm opacity-90 hover:opacity-100",
                )}
                style={{ backgroundColor: colorHex }}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-white drop-shadow-md" />
                )}
              </button>
            );
          })}
        </div>
      )}
    />
  );
}
