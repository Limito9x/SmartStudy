import { taskSchema, type TaskFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import {
  FormCombobox,
  FormDatePicker,
  FormInput,
  FormSelect,
} from "@/components/form-controls";
import { useCourse } from "@/hooks/entities/useCourse";
import type { ResponseCourseDto } from "@/services/api";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  studyPlanId: number;
  defaultValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
}

export default function TaskForm({
  studyPlanId,
  defaultValues,
  onSubmit,
}: TaskFormProps) {
  const { data: courses } = useCourse({ studyPlanId }).getCoursesByStudyPlan;

  return (
    <BaseForm
      schema={taskSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;

        return (
          <>
            <FormInput
              name="name"
              control={control}
              label="Tên nhiệm vụ"
              placeholder="Nhập tên nhiệm vụ"
            />
            <FormInput
              name="description"
              control={control}
              label="Mô tả"
              placeholder="Nhập mô tả (tùy chọn)"
            />
            <FormDatePicker name="dueDate" control={control} label="Ngày học" />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                name="startAt"
                control={control}
                label="Bắt đầu"
                type="time"
              />
              <FormInput
                name="endAt"
                control={control}
                label="Kết thúc"
                type="time"
              />
            </div>
            <FormSelect
              name="type"
              control={control}
              label="Loại nhiệm vụ"
              options={[
                { label: "Học lớp", value: "ClassSession" },
                { label: "Tự học", value: "SelfStudy" },
                { label: "Bài tập", value: "AssignmentWork" },
                { label: "Họp nhóm", value: "Meeting" },
              ]}
            />
            <FormCombobox<TaskFormValues, ResponseCourseDto>
              name="courseId"
              control={control}
              label="Thuộc khóa học"
              placeholder="Chọn khóa học (nếu có)"
              options={courses || []}
              getOptionLabel={(option) => `${option.name}`}
              getOptionValue={(option) => option.id.toString()}
              valueAsNumber
              emptyText="Không tìm thấy khóa học"
            />
            <Button type="submit" className="mt-4">
              Tạo nhiệm vụ
            </Button>
          </>
        );
      }}
    />
  );
}
