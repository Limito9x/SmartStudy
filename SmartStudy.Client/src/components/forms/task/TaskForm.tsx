import { taskSchema, type TaskFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import {
  FormCombobox,
  FormInput,
  FormSelect,
  FormDateTimePicker,
} from "@/components/form-controls";
import { useCourse } from "@/hooks/entities/useCourse";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import type {
  ResponseCourseDto,
  ResponsePhaseDto
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface TaskFormProps {
  showCourseField?: boolean;
  showEventField?: boolean;
  isEditMode?: boolean;
  defaultValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
}

export default function TaskForm({
  showCourseField = true,
  showEventField = true,
  isEditMode = false,
  defaultValues,
  onSubmit,
}: TaskFormProps) {
  const { data: courses } = useCourse({}).getCourses;

  return (
    <BaseForm
      schema={taskSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        const selectedCourseId = methods.watch("courseId");
        const { data: events } = useTimelineEvent({
          courseId: Number(selectedCourseId),
        }).getEventsByCourse;

        useEffect(() => {
          if (
            showEventField &&
            events &&
            events.length === 0 &&
            selectedCourseId
          ) {
            methods.setValue("eventId", undefined);
          }
        }, [events, showEventField, methods]);

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
            <FormSelect
              name="type"
              control={control}
              label="Loại nhiệm vụ"
              options={[
                { label: "Học lớp", value: "ClassSession" },
                { label: "Tự học", value: "SelfStudy" },
                { label: "Bài tập", value: "AssignmentWork" },
                { label: "Họp nhóm", value: "Meeting" },
                { label: "Cột mốc", value: "Milestone" },
              ]}
            />
            <FormDateTimePicker
              control={control}
              name="startDateTime"
              label="Thời gian bắt đầu"
            />
            <FormDateTimePicker
              control={control}
              name="endDateTime"
              label="Thời gian kết thúc"
            />
            {showCourseField && (
              <FormCombobox<TaskFormValues, ResponseCourseDto>
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

            {showEventField && selectedCourseId && (
              <FormCombobox<TaskFormValues, ResponsePhaseDto>
                name="eventId"
                control={control}
                label="Thuộc sự kiện"
                placeholder="Chọn sự kiện (nếu có)"
                options={events || []}
                getOptionLabel={(option) => `${option.title}`}
                getOptionValue={(option) => option.id!.toString()}
                valueAsNumber
                emptyText={"Không tìm thấy sự kiện nào thuộc khóa học đã chọn"}
              />
            )}

            <Button type="submit" className="mt-4">
              {isEditMode ? "Lưu thay đổi" : "Tạo nhiệm vụ"}
            </Button>
          </>
        );
      }}
    />
  );
}
