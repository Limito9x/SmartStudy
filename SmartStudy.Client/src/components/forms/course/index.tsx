import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, type CourseFormValues } from "./schema";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form-controls";
import { useBaseMutation } from "@/hooks/use-mutation";
import { courseService } from "@/services/apiClient";

interface CourseFormProps {
  semesterId: number;
  onSuccess?: () => void;
}

export const CourseForm = ({ semesterId, onSuccess }: CourseFormProps) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      credits: 2,
    },
    mode: "onChange",
  });

  const mutation = useBaseMutation(
    (data: CourseFormValues) => {
      const payload = {
        name: data.name,
        credits: data.credits,
        semesterId: semesterId,
      };
      return courseService.apiCoursesPost(payload);
    },
    {
      queryKey: ["semesters"],
      successMessage: "Thêm lớp học phần thành công!",
      errorMessage: "Thêm lớp học phần thất bại!",
    },
  );

  const onSubmit = (data: CourseFormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Form {...form}>
      <FormInput
        control={form.control}
        label="Tên lớp học phần"
        name="name"
        placeholder="Cơ sở dữ liệu, Lý thuyết đồ thị"
      />
      <FormInput
        control={form.control}
        label="Số tín chỉ"
        name="credits"
        type="number"
        placeholder="2, 3, 4"
      />
      <Button
        onClick={form.handleSubmit(onSubmit)}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Đang thêm..." : "Thêm lớp học phần"}
      </Button>
    </Form>
  );
};
