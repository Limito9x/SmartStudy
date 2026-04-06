import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type {
  CourseEventDto,
  EventRoutineDto,
  EventTaskDto,
} from "@/services/api";
import { useDialogStore } from "@/stores/useDialogStore";
import { Calendar, Flag } from "lucide-react";
import ActionMenu from "@/components/shared/ActionMenu";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";

interface EventDetailPanelProps {
  eventData: CourseEventDto;
  courseId: number;
  eventId?: number;
}

export default function EventDetailPanel({
  eventData,
  courseId,
  eventId,
}: EventDetailPanelProps) {
  const { openDialog } = useDialogStore();
  const { deleteEvent } = useTimelineEvent({ courseId });
  const tasks = eventData.tasks ?? [];
  const routines = eventData.routines ?? [];
  const completedTasks = toNumber(eventData.completedTasks);
  const totalTasks = toNumber(eventData.totalTasks);
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const daysLeft = getDaysLeft(eventData.endDateTime);

  const handleEditEvent = () => {
    if (eventId) {
      openDialog("EVENT_FORM", { eventId: eventId, courseId: courseId });
    }
  };

  const handleDeleteEvent = () => {
    if (eventId) {
      openDialog("CONFIRM_DELETE", {
        itemType: "sự kiện",
        itemName: eventData.title || "Sự kiện chưa đặt tên",
        onConfirm: () => {
          deleteEvent.mutate({ path: {
            timelineEventId: eventId,
          }});
        },
      });
    }
  };

  const handleOpenCreateTask = () => {
    openDialog("TASK_FORM", {
      courseId: courseId || undefined,
      eventId: eventId || undefined,
    });
  };

  const handleOpenCreateRoutine = () => {
    openDialog("ROUTINE_FORM", {
      courseId: courseId || undefined,
      eventId: eventId || undefined,
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border bg-background p-5">
      <div className="rounded-2xl border bg-linear-to-r from-blue-50 to-indigo-50 p-5 text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-900">
                {eventData.title || "Sự kiện chưa đặt tên"}
              </h3>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Hạn hoàn thành: {formatDate(eventData.endDateTime)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              className={
                daysLeft === null
                  ? "bg-slate-100 text-slate-700"
                  : daysLeft < 0
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-800"
              }
            >
              {daysLeft === null
                ? "Chưa có hạn"
                : daysLeft < 0
                  ? "Đã quá hạn"
                  : `⏳ Còn ${daysLeft} ngày`}
            </Badge>

            {eventId && (
              <ActionMenu
                actions={[
                  { label: "Chỉnh sửa", onClick: handleEditEvent },
                  { label: "Xóa", onClick: handleDeleteEvent },
                ]}
              />
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground text-left">
            Tiến độ: {progress}%
          </p>
          <Progress value={progress} />
        </div>
      </div>

      <section className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">📌 Nhiệm vụ trọng tâm</h4>
          <Button variant="ghost" size="sm" onClick={handleOpenCreateTask}>
            + Thêm nhiệm vụ
          </Button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            Chưa có nhiệm vụ trọng tâm.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <TaskRow key={String(task.id ?? index)} task={task} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">🔄 Tiến độ rèn luyện</h4>
          <Button variant="ghost" size="sm" onClick={handleOpenCreateRoutine}>
            + Thêm lịch trình
          </Button>
        </div>
        {routines.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            Chưa có dữ liệu rèn luyện.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {routines.map((routine, index) => (
              <RoutineCard
                key={String(routine.id ?? index)}
                routine={routine}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TaskRow({ task }: { task: EventTaskDto }) {
  const isCompleted = task.status === "Completed";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-white px-3 py-2">
      <Checkbox checked={isCompleted} disabled={true} />
      <p
        className={
          isCompleted
            ? "text-sm text-gray-500 line-through"
            : "text-sm text-slate-900"
        }
      >
        {task.name || "Nhiệm vụ chưa đặt tên"}
      </p>
    </div>
  );
}

function RoutineCard({ routine }: { routine: EventRoutineDto }) {
  const totalOccurrences = toNumber(routine.totalOccurrences);
  const totalCompletion = toNumber(routine.totalCompletion);

  return (
    <div className="rounded-xl border border-border/70 border-l-4 border-l-indigo-500 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">
          {routine.name || "Lịch trình chưa đặt tên"}
        </p>
        <Badge variant="secondary">Mục tiêu: {totalOccurrences} buổi</Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Đã hoàn thành: {totalCompletion} buổi
      </p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDaysLeft(value?: string | null) {
  if (!value) {
    return null;
  }

  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function toNumber(value?: number | string | null) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}
