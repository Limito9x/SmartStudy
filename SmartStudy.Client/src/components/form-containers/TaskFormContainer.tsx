import { useTask } from "@/hooks/entities/useTask";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import TaskForm from "@/components/forms/task/TaskForm";
import type { TaskFormValues } from "@/components/forms/task/schema";
import { taskFormMapper } from "@/utils/mapper/formMapper";
import { useMemo } from "react";
import { taskApiMapper } from "@/utils/mapper/apiMapper";

export default function TaskFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { courseId, phaseId, eventId, taskId, defaultValues } =
    data as DialogDataMap["TASK_FORM"];

  const isEditMode = !!taskId;
  const effectivePhaseId = phaseId ?? eventId;
  const showCourseField = !courseId;
  const showEventField = !effectivePhaseId;
  const { getTaskById, createTask, updateTaskInfo } = useTask();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: taskData, isLoading } = getTaskById(taskId!);
  const finalDefaultValues = useMemo(() => {
    const mapped = taskData ? taskFormMapper.toFormValues(taskData) : undefined;
    const base = defaultValues ??
      mapped ?? {
        name: "",
        description: "",
        startDateTime: null,
        endDateTime: null,
        type: "SelfStudy" as const,
        location: "",
        courseId: null,
        eventId: null,
      };

    return {
      ...base,
      courseId: courseId ?? base.courseId ?? null,
      eventId: effectivePhaseId ?? base.eventId ?? null,
    };
  }, [courseId, defaultValues, effectivePhaseId, taskData]);

  const handleSubmit = (values: TaskFormValues) => {
    const payload = taskApiMapper.toRequestTaskDto(values);

    if (isEditMode) {
      updateTaskInfo.mutate(
        {
          path: { taskId: taskId! },
          body: {
            ...payload,
            phaseId: effectivePhaseId ?? payload.phaseId ?? null,
          },
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
      return;
    }

    createTask.mutate(
      {
        body: {
          ...payload,
          phaseId: effectivePhaseId ?? payload.phaseId ?? null,
        },
      },
      {
        onSuccess: () => closeDialog(),
      },
    );
  };

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <TaskForm
      showCourseField={showCourseField}
      showEventField={showEventField}
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
