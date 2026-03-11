import type { SettingFormValues } from "@/components/forms/user/student-info/schema";
import { useFormContext } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
} from "@/components/form-controls";

export default function Step2Program() {
  const { control, watch } = useFormContext<SettingFormValues>();
  const semestersPerYear = watch("semestersPerYear");

  return (
    <div className="space-y-4">
      <FormDatePicker
        control={control}
        name="admissionDate"
        label="Ngày nhập học"
      />
      <FormSelect
        control={control}
        name="semestersPerYear"
        label="Số học kỳ mỗi năm"
        valueAsNumber
        options={[
          { label: "2 học kỳ chính và 1 học kỳ hè", value: "2" },
          { label: "3 học kỳ chính", value: "3" },
        ]}
      />
      <FormInput
        control={control}
        name="programLength"
        type="number"
        label="Thời gian chương trình (năm)"
      />
      <FormInput
        control={control}
        name="weeksPerSemester"
        type="number"
        label="Số tuần mỗi học kỳ"
      />
      {semestersPerYear === 2 && (
        <FormInput
          control={control}
          name="weeksOfSummerSemester"
          type="number"
          label="Số tuần học kỳ hè"
        />
      )}

      <div className="pt-2">
        <p className="mb-2 text-sm text-muted-foreground">
          Thông tin tùy chọn (có thể bỏ qua)
        </p>
        <div className="space-y-4">
          <FormInput
            control={control}
            name="totalRequiredCredits"
            type="number"
            label="Tổng số tín chỉ yêu cầu"
          />
          <FormInput
            control={control}
            name="creditsPerSemester"
            type="number"
            label="Số tín chỉ mỗi học kỳ"
          />
          {semestersPerYear === 2 && (
            <FormInput
              control={control}
              name="creditsPerSummerSemester"
              type="number"
              label="Số tín chỉ học kỳ hè"
            />
          )}
        </div>
      </div>
    </div>
  );
}
