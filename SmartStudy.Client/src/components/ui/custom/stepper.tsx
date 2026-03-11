import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={step} className="flex flex-1 items-center">
            {/* Cục tròn chứa số hoặc dấu Check */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground" // Đã xong: Xanh đậm, chữ trắng
                    : isActive
                      ? "border-primary text-primary" // Đang ở bước này: Viền xanh, chữ xanh
                      : "border-muted-foreground text-muted-foreground", // Chưa tới: Xám
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-xs font-medium absolute mt-10 w-24 text-center",
                  isActive || isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>

            {/* Đường gạch ngang nối các bước (ẩn ở bước cuối cùng) */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-[2px] flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
