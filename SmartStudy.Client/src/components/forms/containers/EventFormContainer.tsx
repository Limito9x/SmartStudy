import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { EventForm } from "../timeline-event/EventForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { TimelineEventFormValues } from "../timeline-event/schema";
import { timelineEventApiMapper } from "@/utils/mapper.ts/apiMapper";
import { timelineEventFormMapper } from "@/utils/mapper.ts/formMapper";

export default function EventFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { courseId, eventId, defaultValues } =
    data as DialogDataMap["EVENT_FORM"];

  const isEditMode = !!eventId;
  const { getEventById, createEvent, updateEvent } = useTimelineEvent({
    courseId
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

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues =
    isEditMode && EventData
      ? timelineEventFormMapper.toFormValues(EventData) // Map lại chuẩn form nếu cần
      : {
          ...defaultValues,
          title: defaultValues?.title || "",
          type: defaultValues?.type || "Assignment",
          courseId: defaultValues?.courseId || courseId,
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
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
