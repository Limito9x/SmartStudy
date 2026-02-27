import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { semesterSchema, type SemesterFormValues } from "./schema";
import { semesterService } from "@/services/apiClient";
import { FormInput, FormSelect } from "@/components/form-controls";
import RangePicker from "@/components/ui/custom/range-picker";
import { addMonths } from "date-fns";
import { useBaseMutation } from "@/hooks/use-mutation";

interface SemesterFormProps {
  defaultValues?: Partial<SemesterFormValues>;
  onSuccess: () => void;
}

export const SemesterForm = ({
  defaultValues,
  onSuccess,
}: SemesterFormProps) => {
  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: defaultValues || {
      term: 1,
      year: Number(new Date().getFullYear()),
      startDate: new Date(),
      endDate: addMonths(new Date(), 4),
    },
  });

  const control = form.control;

  const endDate = form.watch("endDate");

  const addSemester = useBaseMutation(
    async (newSemester: SemesterFormValues) => {
      const payload = {
        ...newSemester,
        startDate: newSemester.startDate.toISOString(),
        endDate: newSemester.endDate.toISOString(),
      };
      const response = await semesterService.apiSemestersPost(payload);
      return response.data;
    },
    {
      queryKey: ["semesters"],
      successMessage: "Thêm học kỳ thành công!",
      errorMessage: "Có lỗi xảy ra khi thêm học kỳ!",
      options: {
        onSuccess: () => {
          onSuccess();
        },
      },
    },
  );

  const onSubmit = async (values: SemesterFormValues) => {
    try {
      addSemester.mutate(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormSelect
          control={control}
          name="term"
          label="Học kỳ"
          placeholder="Chọn học kỳ"
          options={[
            { value: "1", label: "Học kỳ 1" },
            { value: "2", label: "Học kỳ 2" },
            { value: "3", label: "Học kỳ hè" },
          ]}
        />
        <FormInput
          control={control}
          name="year"
          label="Năm học"
          placeholder="Nhập năm học"
          type="number"
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RangePicker
                  value={
                    field.value ? { from: field.value, to: endDate } : undefined
                  }
                  onChange={(range) => {
                    if (!range) {
                      return;
                    }

                    if (range.from) {
                      form.setValue("startDate", range.from, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }

                    if (range.to) {
                      form.setValue("endDate", range.to, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  label="Thời gian học kỳ"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Lưu học kỳ</Button>
      </form>
    </Form>
  );
};
