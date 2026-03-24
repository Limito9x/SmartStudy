import { useFormContext } from "react-hook-form";
import { FormSelect, FormDatePicker } from "@/components/form-controls";
import type { AcademicContextDto } from "@/services/api";
import type { SettingFormValues } from "@/components/forms/user/student-info/schema";

interface Step2ProgramProps {
  academicContext: AcademicContextDto | undefined;
}

export default function Step2Program({ academicContext }: Step2ProgramProps) {
  const { control } = useFormContext<SettingFormValues>();

  return (
    <div className="space-y-4">
      <FormSelect
        name="termId"
        control={control}
        label="Học kỳ hiện tại"
        placeholder="Chọn học kỳ hiện tại"
        options={
          academicContext?.terms?.map((term) => ({
            value: term.id!.toString(),
            label: term.name || `Học kỳ ${term.termNumber}`,
          })) || []
        }
      />
      <FormSelect
        name="yearId"
        control={control}
        label="Năm học hiện tại"
        placeholder="Chọn năm học hiện tại"
        options={
          academicContext?.years?.map((year) => ({
            value: year.id!.toString(),
            label: `${year.startYear} - ${year.endYear}`,
          })) || []
        }
      />
      <FormDatePicker
        name="startDate"
        control={control}
        label="Ngày bắt đầu học kỳ"
        placeholder="Chọn ngày bắt đầu học"
      />
      <FormDatePicker
        name="endDate"
        control={control}
        label="Ngày kết thúc học kỳ"
        placeholder="Chọn ngày kết thúc học"
      />
    </div>
  );
}
