import { useFormContext } from "react-hook-form";
import { FormDatePicker } from "@/components/form-controls";
import type { SettingFormValues } from "@/components/forms/user/student-info/schema";
import FormAcademicContext from "@/components/form-controls/FormAcademicContext";
import { Label } from "@/components/ui/label";
import { guessAcademicDates } from "@/lib/date-utils";

export default function Step2Program() {
  const { control, setValue, watch } = useFormContext<SettingFormValues>();

  const admissionYear = Number(watch("admissionYear"));
  
  const handleTermChange = (termValue: number, yearValue: number) => {
    // 1. Dựa vào năm nhập học và học kỳ để đoán ngày bắt đầu và kết thúc
    const { startDate, endDate } = guessAcademicDates(termValue, yearValue);
    // 2. Cập nhật lại form với ngày bắt đầu và kết thúc đã đoán được
    setValue("startDate", startDate.toISOString().split("T")[0]);
    setValue("endDate", endDate.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Thông tin học kỳ hiện tại</Label>
      <FormAcademicContext
        control={control}
        setValue={setValue}
        termName="termId"
        yearName="yearId"
        minYear={admissionYear}
        useAcademicContext={handleTermChange}
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
