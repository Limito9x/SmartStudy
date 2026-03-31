import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getCourseEventsOptions } from "@/services/api/@tanstack/react-query.gen";
import EventDetailPanel from "@/components/features/course-events/EventDetailPanel";
import { useDialogStore } from "@/stores/useDialogStore";
import type React from "react";

interface EventsTabProps {
  courseId: number;
}

export default function EventsTab({ courseId }: EventsTabProps) {
  const { openDialog } = useDialogStore();
  const eventsQuery = useQuery({
    ...getCourseEventsOptions({
      path: {
        courseId: courseId,
      },
    }),
    enabled: !!courseId,
  });

  const events = eventsQuery.data ?? [];

  const handleOpenCreateEvent = () => {
    openDialog("EVENT_FORM", {
      courseId: courseId,
    });
  };

  let content: React.ReactNode;

  if (eventsQuery.isLoading) {
    content = (
      <div className="space-y-6">
        {[...Array(2)].map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-2xl" />
        ))}
      </div>
    );
  } else if (eventsQuery.error) {
    const message =
      eventsQuery.error instanceof Error
        ? eventsQuery.error.message
        : "Không xác định";

    content = (
      <p className="text-sm text-destructive">
        Không thể tải sự kiện: {message}
      </p>
    );
  } else if (events.length === 0) {
    content = (
      <p className="text-sm italic text-muted-foreground">
        Chưa có sự kiện nào cho khóa học này.
      </p>
    );
  } else {
    content = (
      <div className="space-y-6">
        {events.map((event, index) => (
          <EventDetailPanel
            key={String(event.id ?? `event-${index}`)}
            eventData={event}
            courseId={courseId}
            eventId={event.id ? Number(event.id) : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Sự kiện & Mục tiêu học tập</h2>
          <p className="text-xs text-muted-foreground">
            Theo dõi các mốc quan trọng và tiến độ hoàn thành mục tiêu.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreateEvent}>
          Thêm sự kiện
        </Button>
      </div>
      {content}
    </div>
  );
}
