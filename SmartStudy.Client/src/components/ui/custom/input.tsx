// components/ui/custom/smart-number-input.tsx
import { Input } from "@/components/ui/input";
import { type FieldValues } from "react-hook-form";

export const SmartNumberInput = ({ field, ...props }: { field: FieldValues }) => {
  return (
    <Input
      {...props}
      type="number"
      // Đảm bảo value luôn là string hoặc number, không bao giờ là null/undefined
      value={field.value ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        // Nếu trống thì trả về null, nếu có số thì ép về kiểu Number
        field.onChange(val === "" ? null : Number(val));
      }}
    />
  );
};
