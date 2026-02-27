import { type SettingFormValues, settingSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { userService } from "@/services/apiClient";
import { generateSemesters } from "@/utils/semesterGenerator";
import type { UserSettingDto } from "@/services/api";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
} from "@/components/form-controls";
import { SemesterPreviewList } from "@/components/features/user/setting/SemesterPreviewList";
import { Button } from "@/components/ui/button";

export const SettingForm = () => {
  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      admissionDate:
        new Date().getMonth() >= 8
          ? new Date(new Date().getFullYear(), 8, 1)
          : new Date(new Date().getFullYear() - 1, 8, 1),
      semestersPerYear: 2,
      weeksPerSemester: 16,
      weeksOfSummerSemester: 8,
      programLength: 4,
      semesters: [],
    },
  });

  const chosenSemPerYear = form.watch("semestersPerYear");
  const semesters = form.watch("semesters");

  const onSubmit = async (data: SettingFormValues) => {
    try {
      const semesters =
        form.getValues("semesters").length > 0
          ? form.getValues("semesters")
          : generateSemesters(
              data.admissionDate,
              data.programLength,
              data.semestersPerYear,
              data.weeksPerSemester,
              data.weeksOfSummerSemester,
            );

      const payload: UserSettingDto = {
        admissionDate: data.admissionDate.toISOString(),
        semestersPerYear: data.semestersPerYear,
        weeksPerSemester: data.weeksPerSemester,
        weeksOfSummerSemester: data.weeksOfSummerSemester,
        programLength: data.programLength,
        semesters: semesters.map((s) => ({
          term: s.term,
          year: s.year,
          startDate: s.startDate.toISOString(),
          endDate: s.endDate.toISOString(),
        })),
      };

      await userService.apiUsersSettingPost(payload);

      alert("Cài đặt đã được lưu thành công!");
    } catch (error) {
      console.error("Lưu cài đặt thất bại:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormDatePicker
          name="admissionDate"
          label="Ngày nhập học"
          control={form.control}
        />
        <FormSelect
          name="semestersPerYear"
          label="Số học kỳ mỗi năm"
          options={[
            { value: "2", label: "2 học kỳ chính + 1 học kỳ hè (nếu có)" },
            { value: "3", label: "3 học kỳ chính" },
          ]}
          control={form.control}
        />
        <FormInput
          name="weeksPerSemester"
          label="Số tuần mỗi học kỳ chính"
          type="number"
          control={form.control}
        />
        {chosenSemPerYear === 2 && (
          <FormInput
            name="weeksOfSummerSemester"
            label="Số tuần học kỳ hè (nếu có)"
            type="number"
            control={form.control}
          />
        )}

        <FormInput
          name="programLength"
          label="Thời gian đào tạo (số năm)"
          type="number"
          control={form.control}
        />
        <Button
          type="button"
          onClick={() => {
            const values = form.getValues();
            const semesters = generateSemesters(
              values.admissionDate,
              values.programLength,
              values.semestersPerYear,
              values.weeksPerSemester,
              values.weeksOfSummerSemester,
            );
            form.setValue("semesters", semesters);
          }}
        >
          Tạo lịch học tự động
        </Button>
        {semesters.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Xem trước lịch học:</h3>
            <SemesterPreviewList semesters={semesters} />
          </div>
        )}
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Lưu cài đặt
        </Button>
      </form>
    </Form>
  );
};
