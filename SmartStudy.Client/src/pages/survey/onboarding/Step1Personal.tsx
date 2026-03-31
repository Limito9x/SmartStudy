import type { SettingFormValues } from "@/components/forms/user/student-info/schema";
import { useFormContext } from "react-hook-form";
import { FormInput } from "@/components/form-controls";

export default function Step1Personal() {
  const { control } = useFormContext<SettingFormValues>();

  return (
    <div className="space-y-4">
      <FormInput
        control={control}
        name="university"
        label="Tên trường đại học"
      />
      <FormInput control={control} name="major" label="Ngành học" />
      <FormInput control={control} name="cohort" label="Khóa" />
      <FormInput
        control={control}
        name="admissionYear"
        label="Năm nhập học"
        type="number"
      />
    </div>
  );
}
