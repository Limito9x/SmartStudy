import { courseSchema, type CourseFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import { FormInput } from "@/components/form-controls";
import { FormColorPicker } from "@/components/form-controls/FormColorPicket";
import { Button } from "@/components/ui/button";

interface CourseFormProps {
  defaultValues?: Partial<CourseFormValues>;
  isEditMode?: boolean;
  onSubmit: (values: CourseFormValues) => void;
}

export default function CourseForm({
  defaultValues,
  isEditMode = false,
  onSubmit,
}: CourseFormProps) {

  return (
    <BaseForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={courseSchema}
      children={(courseForm) => {
        return (
          <>
            <FormInput
              name="name"
              control={courseForm.control}
              label="Tên khóa học"
              placeholder="Nhập tên khóa học"
            />
            <FormColorPicker
              name="color"
              control={courseForm.control}
              label="Chọn màu đại diện"
            />
            <Button variant="default" type="submit">
              {isEditMode ? "Cập nhật" : "Tạo khóa học"}
            </Button>
          </>
        );
      }}
    />
  );
}
