import { useRoutine } from "@/hooks/entities/useRoutine";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import RoutineForm from "@/components/forms/routine/RoutineForm";
import { routineFormMapper } from "@/utils/mapper/formMapper";
import { useMemo } from "react";
import { routineApiMapper } from "@/utils/mapper/apiMapper";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";

export default function RoutineFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { courseId, phaseId, eventId, routineId, defaultValues } =
    data as DialogDataMap["ROUTINE_FORM"];

  const isEditMode = !!routineId;
  const effectivePhaseId = phaseId ?? eventId;
  const fixedPhaseId = effectivePhaseId ? Number(effectivePhaseId) : 0;
  const showCourseField = !courseId;
  const showEventField = !effectivePhaseId;
  const { getRoutineById, createRoutine, updateRoutine } = useRoutine();
  const { getEventById } = useTimelineEvent({
    courseId: courseId ? Number(courseId) : undefined,
  });
  const { data: fixedPhase } = getEventById(fixedPhaseId);

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: routineData, isLoading } = getRoutineById(routineId!);
  const finalDefaultValues = useMemo(() => {
    const mapped = routineData
      ? routineFormMapper.toFormValues(routineData)
      : undefined;
    const base = defaultValues ??
      mapped ?? {
        name: "",
        instructor: "",
        description: "",
        type: "SelfStudy" as const,
        courseId: null,
        eventId: null,
        startDate: null,
        endDate: null,
        schedules: [],
      };

    return {
      ...base,
      type: base.type || "SelfStudy",
      courseId: courseId ?? base.courseId ?? null,
      eventId: effectivePhaseId ?? base.eventId ?? null,
    };
  }, [courseId, defaultValues, effectivePhaseId, routineData]);

  const handleSubmit = (values: RoutineFormValues) => {
    const payload = routineApiMapper.toRequestRoutineDto(values);

    if (isEditMode) {
      updateRoutine.mutate(
        {
          path: { id: routineId! },
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

    createRoutine.mutate(
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
    <RoutineForm
      showCourseField={showCourseField}
      showEventField={showEventField}
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      fixedPhase={fixedPhase ?? null}
      onSubmit={handleSubmit}
    />
  );
}
