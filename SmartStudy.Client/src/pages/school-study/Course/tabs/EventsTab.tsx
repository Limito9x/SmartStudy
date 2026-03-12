import { Calendar, Plus, Flag, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { useDialogStore } from "@/stores/useDialogStore";
import { EventForm } from "@/components/forms/timeline-event/EventForm";
import { timelineEventApiMapper } from "@/utils/mapper.ts/apiMapper";
import { timelineEventFormMapper } from "@/utils/mapper.ts/formMapper";
import { type ResponseTimelineEventDto } from "@/services/api";
import ConfirmDelete from "@/components/ui/common/ConfirmDelete";

const priorityConfig = {
  3: { label: "Cao", color: "text-red-500", bg: "bg-red-50" },
  2: { label: "Vừa", color: "text-yellow-600", bg: "bg-yellow-50" },
  1: { label: "Thấp", color: "text-green-600", bg: "bg-green-50" },
};

const typeConfig: Record<string, { label: string }> = {
  Assignment: { label: "Nộp bài" },
  Exam: { label: "Thi cử" },
  Presentation: { label: "Thuyết trình" },
  Other: { label: "Khác" },
};

const formatDueDate = (dueDate: string | null | undefined) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (date.getFullYear() <= 1) return null;
  return date.toLocaleDateString("vi-VN");
};

export default function EventsTab({ courseId }: { courseId: number }) {
  const { getEventsByCourse, updateEvent, createEvent, deleteEvent } =
    useTimelineEvent({
      courseId,
    });
  const { data: events } = getEventsByCourse;

  const { openDialog, closeDialog } = useDialogStore();

  const handleCreateEvent = () => {
    openDialog({
      title: "Thêm sự kiện mới",
      view: (
        <EventForm
          defaultValues={{
            title: "",
            type: "Assignment",
            priority: 2,
            dueDate: "",
            notes: "",
            location: "",
            courseId: courseId,
          }}
          onSubmit={(data) => {
            createEvent.mutate(
              {
                body: timelineEventApiMapper.toRequestTimelineEventDto(
                  data,
                  courseId,
                ),
              },
              {
                onSuccess: () => {
                  closeDialog();
                },
              },
            );
          }}
        />
      ),
    });
  };

  const handleUpdateEvent = (id: number, data: ResponseTimelineEventDto) => {
    openDialog({
      title: "Cập nhật sự kiện",
      view: (
        <EventForm
          defaultValues={timelineEventFormMapper.toFormValues(data)}
          onSubmit={(formData) => {
            updateEvent.mutate({
              body: timelineEventApiMapper.toRequestTimelineEventDto(
                formData,
                courseId,
              ),
              path: {
                timelineEventId: id,
              },
            });
          }}
        />
      ),
    });
  };

  const handleDeleteEvent = (id: number) => {
    openDialog({
      title: "Xác nhận xóa",
      view: (
        <ConfirmDelete
          message="Bạn có chắc chắn muốn xóa sự kiện này không?"
          onConfirm={() => {
            deleteEvent.mutate({
              path: {
                timelineEventId: id,
              },
            });
            closeDialog();
          }}
          onCancel={closeDialog}
        />
      ),
    });
  };

  return (
    <div className="space-y-4">
      {events?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chưa có sự kiện nào
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {events?.map((event) => {
            const p =
              priorityConfig[event.priority as keyof typeof priorityConfig];
            const formattedDate = formatDueDate(event.dueDate);

            return (
              <div
                key={event.id}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3"
              >
                {/* Top row: priority icon + title + actions */}
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg ${p?.bg} shrink-0 mt-0.5`}>
                    <Flag size={14} className={p?.color} />
                  </div>
                  <p className="font-medium text-sm flex-1 min-w-0 leading-snug">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleUpdateEvent(Number(event.id), event)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteEvent(Number(event.id))}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                {/* Bottom row: type badge + date */}
                <div className="flex items-center gap-2 flex-wrap pl-8">
                  <Badge variant="outline" className="text-xs h-5">
                    {typeConfig[event.type]?.label ?? event.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={11} />
                    <span>{formattedDate ?? "Chưa có ngày"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        onClick={handleCreateEvent}
      >
        <Plus size={14} /> Thêm sự kiện
      </Button>
    </div>
  );
}
