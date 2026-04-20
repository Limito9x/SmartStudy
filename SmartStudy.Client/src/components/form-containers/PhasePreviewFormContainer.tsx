import { useMemo } from "react";
import { toast } from "sonner";
import { useDialogStore, type DialogDataMap } from "@/stores/useDialogStore";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { useTask } from "@/hooks/entities/useTask";
import { useRoutine } from "@/hooks/entities/useRoutine";
import {
  routineApiMapper,
  taskApiMapper,
  timelineEventApiMapper,
} from "@/utils/mapper/apiMapper";
import PhasePreviewForm from "@/components/forms/phase-preview/PhasePreviewForm";
import type {
  PhasePreviewFormValues,
  PhasePreviewSuggestedRoutine,
  PhasePreviewSuggestedTask,
} from "@/components/forms/phase-preview/schema";

const parseDateOrNow = (value?: string | null) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const toTaskDefaults = (task: PhasePreviewSuggestedTask) => ({
  name: task.name,
  description: task.description ?? "",
  startDateTime: parseDateOrNow(task.startDateTime),
  endDateTime: parseDateOrNow(task.endDateTime),
  type: task.type,
  courseId: null,
  eventId: null,
});

const toRoutineDefaults = (routine: PhasePreviewSuggestedRoutine) => ({
  name: routine.name,
  instructor: routine.instructor ?? "",
  description: routine.description ?? "",
  type: routine.type,
  courseId: null,
  eventId: null,
  startDate: routine.startDate ? parseDateOrNow(routine.startDate) : null,
  endDate: routine.endDate ? parseDateOrNow(routine.endDate) : null,
  schedules:
    routine.schedules?.map((schedule) => ({
      id: 0,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      duration: schedule.duration,
      location: schedule.location ?? "",
    })) ?? [],
});

export default function PhasePreviewFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const {
    courseId,
    phaseDefaultValues,
    suggestedTasks = [],
    suggestedRoutines = [],
  } = data as DialogDataMap["PHASE_PREVIEW_FORM"];

  const { createEvent } = useTimelineEvent({ courseId });
  const { createTask } = useTask();
  const { createRoutine } = useRoutine();

  const defaultValues = useMemo<PhasePreviewFormValues>(() => {
    const startDateTime = parseDateOrNow(phaseDefaultValues?.startDateTime);
    const endDateTime = phaseDefaultValues?.endDateTime
      ? parseDateOrNow(phaseDefaultValues.endDateTime)
      : new Date(startDateTime.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      title: phaseDefaultValues?.title ?? "Phase từ AI preview",
      type: phaseDefaultValues?.type ?? "ExamPrep",
      priority: Number(phaseDefaultValues?.priority ?? 2),
      startDateTime,
      endDateTime,
      notes: phaseDefaultValues?.notes ?? "",
      applyTasks: suggestedTasks.length > 0,
      applyRoutines: suggestedRoutines.length > 0,
    };
  }, [phaseDefaultValues, suggestedRoutines.length, suggestedTasks.length]);

  const handleSubmit = async (values: PhasePreviewFormValues) => {
    try {
      const createdPhase = await createEvent.mutateAsync({
        body: timelineEventApiMapper.toRequestTimelineEventDto({
          courseId,
          title: values.title,
          type: values.type,
          priority: values.priority,
          startDateTime: values.startDateTime,
          endDateTime: values.endDateTime,
          isAllDay: false,
          location: null,
          notes: values.notes ?? null,
        }),
      });

      const createdPhaseId = Number(createdPhase.id);

      let createdTaskCount = 0;
      if (values.applyTasks && suggestedTasks.length > 0) {
        await Promise.all(
          suggestedTasks.map(async (task) => {
            await createTask.mutateAsync({
              body: {
                ...taskApiMapper.toRequestTaskDto(toTaskDefaults(task)),
                phaseId: createdPhaseId,
              },
            });
          }),
        );
        createdTaskCount = suggestedTasks.length;
      }

      let createdRoutineCount = 0;
      if (values.applyRoutines && suggestedRoutines.length > 0) {
        await Promise.all(
          suggestedRoutines.map(async (routine) => {
            await createRoutine.mutateAsync({
              body: {
                ...routineApiMapper.toRequestRoutineDto(
                  toRoutineDefaults(routine),
                ),
                phaseId: createdPhaseId,
              },
            });
          }),
        );
        createdRoutineCount = suggestedRoutines.length;
      }

      toast.success(
        `Đã tạo phase mới${createdTaskCount || createdRoutineCount ? ` | task: ${createdTaskCount}, routine: ${createdRoutineCount}` : ""}`,
      );
      closeDialog();
    } catch {
      toast.error("Không thể tạo phase từ preview. Vui lòng thử lại.");
    }
  };

  return (
    <PhasePreviewForm
      defaultValues={defaultValues}
      suggestedTasks={suggestedTasks}
      suggestedRoutines={suggestedRoutines}
      isSubmitting={
        createEvent.isPending || createTask.isPending || createRoutine.isPending
      }
      onSubmit={handleSubmit}
    />
  );
}
