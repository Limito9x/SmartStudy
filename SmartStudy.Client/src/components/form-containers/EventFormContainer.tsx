import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { EventForm } from "../forms/timeline-event/EventForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { TimelineEventFormValues } from "../forms/timeline-event/schema";
import { timelineEventApiMapper } from "@/utils/mapper/apiMapper";
import { timelineEventFormMapper } from "@/utils/mapper/formMapper";

export default function EventFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { courseId, eventId, defaultValues } =
    data as DialogDataMap["EVENT_FORM"];

  const isEditMode = !!eventId;
  const { getEventById, createEvent, updateEvent } = useTimelineEvent({
    courseId,
  });

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: EventData, isLoading } = getEventById(eventId!);

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
      ? timelineEventFormMapper.toFormValues(EventData) // Map lại chuẩn form nếu cần
      : {
          ...defaultValues,
          priority: defaultValues?.priority || 1,
          title: defaultValues?.title || "",
          type: defaultValues?.type || "Assignment",
          courseId: Number(defaultValues?.courseId || courseId),
          dueDate: defaultValues?.dueDate
            ? new Date(defaultValues.dueDate)
            : undefined,
        };

  const handleSubmit = (values: TimelineEventFormValues) => {
    if (isEditMode) {
      updateEvent.mutate(
        {
          path: { timelineEventId: eventId! },
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
