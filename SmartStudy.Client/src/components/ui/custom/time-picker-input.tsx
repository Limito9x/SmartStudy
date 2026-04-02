import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: "hours" | "minutes" | "seconds";
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onLeftFocus?: () => void;
  onRightFocus?: () => void;
  onChange: (value: number) => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "number",
      picker,
      date,
      setDate,
      onLeftFocus,
      onRightFocus,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
      setFlag(true);
    };

    const handleBlur = () => {
      setFlag(false);
    };

    const displayValue = React.useMemo(() => {
      if (!date) return "00";
      switch (picker) {
        case "hours":
          return date.getHours().toString().padStart(2, "0");
        case "minutes":
          return date.getMinutes().toString().padStart(2, "0");
        case "seconds":
          return date.getSeconds().toString().padStart(2, "0");
        default:
          return "00";
      }
    }, [date, picker]);

    return (
      <Input
        ref={ref}
        id={picker}
        name={picker}
        className={cn(
          "w-[48px] text-center text-base focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
        value={flag ? (props.value ?? "") : displayValue}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          if (!isNaN(value)) {
            onChange(value);
          }
        }}
        type={type}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);

TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput };
