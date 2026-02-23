import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { semesterSchema, type SemesterFormValues } from "./schema";
import { semesterService } from "@/services/apiClient";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RangePicker from "@/components/ui/custom/range-picker";
import { addMonths } from "date-fns";

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
      year: new Date().getFullYear(),
      startDate: new Date(),
      endDate: addMonths(new Date(), 4),
      targetGPA: null,
    },
  });

  const endDate = form.watch("endDate");

  const queryClient = useQueryClient();

  const addSemesterMutation = useMutation({
    mutationFn: async (newSemester: SemesterFormValues) => {
      const payload = {
        ...newSemester,
        startDate: newSemester.startDate.toISOString(),
        endDate: newSemester.endDate.toISOString(),
      };

      const response = await semesterService.apiSemestersPost(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      onSuccess();
    },
  });

  const onSubmit = async (values: SemesterFormValues) => {
    try {
      addSemesterMutation.mutate(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Học kỳ</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Học kỳ 1</SelectItem>
                    <SelectItem value="2">Học kỳ 2</SelectItem>
                    <SelectItem value="3">Học kỳ hè</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Năm học</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Năm học" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
        <FormField
          control={form.control}
          name="targetGPA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GPA mục tiêu</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="GPA mục tiêu (0.00 - 4.00)"
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                    )
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Lưu học kỳ</Button>
      </form>
    </Form>
  );
};
