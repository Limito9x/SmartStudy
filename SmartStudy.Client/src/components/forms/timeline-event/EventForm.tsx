import { timelineEventSchema, type TimelineEventFormValues } from "./schema";
import { type ResponseCourseDto } from "@/services/api";
import { BaseForm } from "../base/BaseForm";
import {
  FormInput,
  FormSelect,
  FormCombobox,
  FormDateTimePicker,
} from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { useCourse } from "@/hooks/entities/useCourse";

interface EventFormProps {
  courseId?: number;
  defaultValues?: TimelineEventFormValues;
  onSubmit: (data: TimelineEventFormValues) => void;
}

export const EventForm = ({
  defaultValues,
  onSubmit,
  courseId,
}: EventFormProps) => {
  const { data: courses } = useCourse({}).getCourses;
  return (
    <BaseForm
      schema={timelineEventSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        return (
          <>
            <FormInput
              name="title"
              control={control}
              label="Tiêu đề sự kiện"
              placeholder="Nhập tiêu đề sự kiện"
            />
            <FormSelect
              name="type"
              control={control}
              label="Loại sự kiện"
              placeholder="Chọn loại sự kiện"
              options={[
                { label: "Nộp bài", value: "Assignment" },
                { label: "Thi cử", value: "Exam" },
                { label: "Thuyết trình", value: "Presentation" },
                { label: "Khác", value: "Other" },
              ]}
            />
            {courseId === undefined && (
              <FormCombobox<TimelineEventFormValues, ResponseCourseDto>
                name="courseId"
                control={control}
                label="Thuộc khóa học"
                placeholder="Chọn khóa học (nếu có)"
                options={courses || []}
                getOptionLabel={(option) => `${option.name}`}
                getOptionValue={(option) => option.id!.toString()}
                valueAsNumber
                emptyText="Không tìm thấy khóa học"
              />
            )}

            <FormSelect
              name="priority"
              control={control}
              label="Mức độ ưu tiên"
              placeholder="Chọn mức độ ưu tiên"
              options={[
                { label: "Cao", value: "3" },
                { label: "Vừa", value: "2" },
                { label: "Thấp", value: "1" },
              ]}
            />
            <FormDateTimePicker
                control={control}
                name="startDateTime"
                label="Ngày bắt đầu"
              />
              <FormDateTimePicker
                control={control}
                name="endDateTime"
                label="Ngày kết thúc"
              />

            <Button type="submit">Lưu</Button>
          </>
        );
      }}
    />
  );
};
