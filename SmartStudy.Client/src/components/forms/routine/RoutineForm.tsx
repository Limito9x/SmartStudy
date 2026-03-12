import { routineSchema, type RoutineFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import {
  FormInput,
  FormSelect,
  FormCombobox,
  FormDatePicker
} from "@/components/form-controls";
import { useCourse } from "@/hooks/entities/useCourse";
import type { ResponseCourseDto } from "@/services/api";
import { Button } from "@/components/ui/button";

interface RoutineFormProps {
  studyPlanId: number;
  defaultValues?: RoutineFormValues;
  onSubmit: (values: RoutineFormValues) => void;
}

export default function RoutineForm({
  studyPlanId,
  defaultValues,
  onSubmit,
}: RoutineFormProps) {
  const { data: courses } = useCourse({ studyPlanId }).getCoursesByStudyPlan;
  return (
    <BaseForm
      schema={routineSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        return (
          <>
            <FormInput
              name="name"
              control={control}
              label="Tên lịch trình"
              placeholder="Nhập tên lịch trình"
            />
            <FormInput
              name="description"
              control={control}
              label="Mô tả"
              placeholder="Nhập mô tả (tùy chọn)"
            />
            <FormSelect
              name="type"
              control={control}
              label="Loại lịch trình"
              options={[
                { label: "Học lớp", value: "ClassSession" },
                { label: "Tự học", value: "SelfStudy" },
                { label: "Bài tập", value: "AssignmentWork" },
                { label: "Họp nhóm", value: "Meeting" },
              ]}
            />
            <FormCombobox<RoutineFormValues, ResponseCourseDto>
              name="courseId"
              control={control}
              label="Thuộc khóa học"
              placeholder="Chọn khóa học (nếu có)"
              options={courses || []}
              getOptionLabel={(option) =>
                `${option.subjectName} - ${option.mentor}`
              }
              getOptionValue={(option) => option.id.toString()}
              valueAsNumber
              emptyText="Không tìm thấy khóa học"
            />
            <FormDatePicker
              name="startDate"
              control={control}
              label="Ngày bắt đầu"
              minDate={new Date()}
            />
            <FormDatePicker
              name="endDate"
              control={control}
              label="Ngày kết thúc"
              minDate={new Date()}
            />
            <Button type="submit" className="mt-4">
              Lưu
            </Button>
          </>
        );
      }}
    />
  );
}
