import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { EventForm } from "../forms/timeline-event/EventForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { TimelineEventFormValues } from "../forms/timeline-event/schema";
import { timelineEventApiMapper } from "@/utils/mapper/apiMapper";
import { timelineEventFormMapper } from "@/utils/mapper/formMapper";

export default function EventFormContainer() {
  const { data, type, closeDialog } = useDialogStore();

  // Hỗ trợ cả EVENT_FORM lẫn PHASE_FORM
  const rawData = data as
    | DialogDataMap["EVENT_FORM"]
    | DialogDataMap["PHASE_FORM"];
  const courseId = rawData?.courseId;
  const eventId = "eventId" in rawData ? rawData.eventId : undefined;
  const phaseId = "phaseId" in rawData ? rawData.phaseId : undefined;
  const resolvedEventId = eventId ?? phaseId;
  const defaultValues = rawData?.defaultValues;

  const isEditMode = !!resolvedEventId;
  const { getEventById, createEvent, updateEvent } = useTimelineEvent({
    courseId,
  });

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: EventData, isLoading } = getEventById(resolvedEventId!);

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const finalDefaultValues =
    isEditMode && EventData
      ? timelineEventFormMapper.toFormValues(EventData)
      : {
          ...defaultValues,
          priority: defaultValues?.priority || 1,
          title: defaultValues?.title || "",
          type: defaultValues?.type || "General",
          courseId: Number(defaultValues?.courseId || courseId),
          startDateTime: defaultValues?.startDateTime
            ? new Date(defaultValues.startDateTime)
            : new Date(),
          endDateTime: defaultValues?.endDateTime
            ? new Date(defaultValues.endDateTime)
            : new Date(Date.now() + 3600000),
          isAllDay: defaultValues?.isAllDay || false,
        };

  const handleSubmit = (values: TimelineEventFormValues) => {
    if (isEditMode) {
      updateEvent.mutate(
        {
          path: { phaseId: resolvedEventId! },
          body: timelineEventApiMapper.toRequestTimelineEventDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createEvent.mutate(
        {
          body: timelineEventApiMapper.toRequestTimelineEventDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <EventForm
      courseId={courseId}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
