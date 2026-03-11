import { Input } from "@/components/ui/input";
import React from "react";

// Dùng forwardRef để react-hook-form có thể focus vào ô input khi có lỗi
export const NumberInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        type="text" // BẮT BUỘC LÀ TEXT ĐỂ TẮT MŨI TÊN VÀ SCROLL CHUỘT
        inputMode="numeric" // Giúp điện thoại hiện bàn phím số
        value={value ?? ""}
        onChange={(e) => {
          // Thuật toán: Đá văng mọi thứ không phải là số (0-9)
          const val = e.target.value.replace(/\D/g, "");

          // Trả về null nếu rỗng, trả về Number nếu có số
          onChange(val === "" ? null : Number(val));
        }}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";
