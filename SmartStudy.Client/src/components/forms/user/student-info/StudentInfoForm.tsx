import { BaseForm } from "../../base/BaseForm";
import { settingSchema, type SettingFormValues } from "./schema";
import { FormInput, FormDatePicker } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface StudentInfoFormProps {
  defaultValues: SettingFormValues;
  onSubmit: (values: SettingFormValues) => void;
  submitLabel?: string;
}

export default function StudentInfoForm({
  defaultValues,
  onSubmit,
  submitLabel = "Tiếp theo",
}: StudentInfoFormProps) {
  return (
    <BaseForm
      schema={settingSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        return (
          <>
            <FormDatePicker
              control={control}
              name="admissionDate"
              label="Ngày nhập học"
              placeholder="Chọn ngày nhập học"
            />
            <FormInput
              control={control}
              name="semestersPerYear"
              label="Số học kỳ mỗi năm"
              type="number"
              placeholder="Nhập số học kỳ mỗi năm (1, 2 hoặc 3)"
            />
            <FormInput
              control={control}
              name="weeksPerSemester"
              label="Số tuần mỗi học kỳ chính"
              type="number"
              placeholder="Nhập số tuần mỗi học kỳ chính"
            />
            <FormInput
              control={control}
              name="weeksOfSummerSemester"
              label="Số tuần học kỳ hè (nếu có)"
              type="number"
              placeholder="Nhập số tuần học kỳ hè (nếu có)"
            />
            <FormInput
              control={control}
              name="programLength"
              label="Thời gian đào tạo (năm)"
              type="number"
              placeholder="Nhập thời gian đào tạo (năm)"
            />
            <Button type="submit">{submitLabel}</Button>
          </>
        );
      }}
    />
  );
}
