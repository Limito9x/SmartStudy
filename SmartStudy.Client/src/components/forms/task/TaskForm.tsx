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
import type { ResponseCourseDto, ResponsePhaseDto } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";
import { addMinutes, endOfDay, format, startOfDay } from "date-fns";

interface TaskFormProps {
  showCourseField?: boolean;
  showEventField?: boolean;
  isEditMode?: boolean;
  defaultValues?: TaskFormValues;
  fixedPhase?: ResponsePhaseDto | null;
  onSubmit: (values: TaskFormValues) => void;
}

const parseDateOrUndefined = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default function TaskForm({
  showCourseField = true,
  showEventField = true,
  isEditMode = false,
  defaultValues,
  fixedPhase,
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
        const selectedEventId = methods.watch("eventId");
        const watchedStartDateTime = methods.watch("startDateTime");
        const watchedEndDateTime = methods.watch("endDateTime");

        const activePhase = useMemo(() => {
          if (fixedPhase) return fixedPhase;
          if (!events || !selectedEventId) return undefined;
          return events.find(
            (event) => Number(event.id) === Number(selectedEventId),
          );
        }, [events, fixedPhase, selectedEventId]);

        const phaseStartDateTime = parseDateOrUndefined(
          activePhase?.startDateTime,
        );
        const phaseEndDateTime = parseDateOrUndefined(activePhase?.endDateTime);

        const minDate = phaseStartDateTime
          ? startOfDay(phaseStartDateTime)
          : undefined;
        const maxDate = phaseEndDateTime
          ? endOfDay(phaseEndDateTime)
          : undefined;

        useEffect(() => {
          if (
            showEventField &&
            events &&
            events.length === 0 &&
            selectedCourseId
          ) {
            methods.setValue("eventId", undefined);
          }
        }, [events, showEventField, methods, selectedCourseId]);

        useEffect(() => {
          if (!watchedStartDateTime) return;
          methods.setValue("endDateTime", addMinutes(watchedStartDateTime, 60));
        }, [methods, watchedStartDateTime]);

        useEffect(() => {
          const currentStart = watchedStartDateTime;
          const currentEnd = watchedEndDateTime;

          if (
            phaseStartDateTime &&
            currentStart &&
            currentStart < phaseStartDateTime
          ) {
            methods.setValue("startDateTime", phaseStartDateTime);
          }
          if (
            phaseEndDateTime &&
            currentStart &&
            currentStart > phaseEndDateTime
          ) {
            methods.setValue("startDateTime", phaseEndDateTime);
          }

          if (
            phaseStartDateTime &&
            currentEnd &&
            currentEnd < phaseStartDateTime
          ) {
            methods.setValue("endDateTime", phaseStartDateTime);
          }
          if (phaseEndDateTime && currentEnd && currentEnd > phaseEndDateTime) {
            methods.setValue("endDateTime", phaseEndDateTime);
          }
        }, [
          methods,
          phaseEndDateTime,
          phaseStartDateTime,
          selectedEventId,
          watchedEndDateTime,
          watchedStartDateTime,
        ]);

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
              minDate={minDate}
              maxDate={maxDate}
            />
            <FormDateTimePicker
              control={control}
              name="endDateTime"
              label="Thời gian kết thúc"
              minDate={minDate}
              maxDate={maxDate}
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
                label="Thuộc giai đoạn"
                placeholder="Chọn giai đoạn"
                options={events || []}
                getOptionLabel={(option) => `${option.title}`}
                getOptionValue={(option) => option.id!.toString()}
                valueAsNumber
                emptyText={"Không tìm thấy sự kiện nào thuộc khóa học đã chọn"}
              />
            )}

            {activePhase && (phaseStartDateTime || phaseEndDateTime) && (
              <p className="text-xs text-blue-600 italic mt-1">
                {`Phạm vi giai đoạn ${activePhase.title}: ${phaseStartDateTime ? format(phaseStartDateTime, "dd/MM/yyyy HH:mm") : "..."} - ${phaseEndDateTime ? format(phaseEndDateTime, "dd/MM/yyyy HH:mm") : "..."}`}
              </p>
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
