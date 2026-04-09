import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResponseTaskDto } from "@/services/api";
import { useTask } from "@/hooks/entities/useTask";
import ActionMenu from "@/components/shared/ActionMenu";
import { useDialogStore } from "@/stores/useDialogStore";
import type { PanelDataMap } from "@/stores/usePanelStore";
import { usePanelStore } from "@/stores/usePanelStore";
import { CalendarClock, ChevronRight } from "lucide-react";
import { formatTaskDateTime } from "@/utils/dateUtils";
import { renderTaskIcon, getStatusStyle } from "../../task/FormatTask";
import { toast } from "sonner";

interface CourseTaskCardProps {
  taskData: ResponseTaskDto;
}

export default function CourseTaskCard({ taskData }: CourseTaskCardProps) {
  const { updateTaskStatus, deleteTaskById } = useTask();
  const { openDialog } = useDialogStore();
  const { openPanel, isOpen, type, data } = usePanelStore();
  const task = taskData;

  if (!task) {
    return null;
  }

  const taskId = normalizeId(task.id);
  const statusStyle = getStatusStyle(task.status);
  const activeTaskId =
    isOpen && type === "TASK_DETAIL"
      ? normalizeId((data as PanelDataMap["TASK_DETAIL"] | null)?.taskId ?? 0)
      : null;
  const isActive = activeTaskId === taskId;

  const handleOpenTaskDetail = () => {
    openPanel("TASK_DETAIL", { taskId });
  };

  const handleEditTask = () => {
    openDialog("TASK_FORM", {
      taskId,
      courseId: Number(task.courseId ?? 0),
      eventId: Number(task.timelineEventId ?? 0),
    });
  };

  const handleToggleTaskStatus = () => {
    const nextStatus = task.status === "Completed" ? "InProgress" : "Completed";

    updateTaskStatus.mutate(
      {
        path: { taskId },
        body: { status: nextStatus },
      },
      {
        onSuccess: () => {
          toast.success(
            nextStatus === "Completed"
              ? "Đã đánh dấu hoàn thành task"
              : "Đã chuyển task về trạng thái đang làm",
          );
        },
        onError: () => {
          toast.error("Không thể cập nhật trạng thái task");
        },
      },
    );
  };

  const handleDeleteTask = () => {
    openDialog("CONFIRM_DELETE", {
      itemType: "task",
      itemName: task.name,
      onConfirm: () => {
        deleteTaskById.mutate(
          {
            path: { taskId },
          },
          {
            onSuccess: () => {
              toast.success("Đã xóa task");
            },
            onError: () => {
              toast.error("Không thể xóa task");
            },
          },
        );
      },
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      onClick={handleOpenTaskDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenTaskDetail();
        }
      }}
      className={cn(
        "rounded-xl border p-3 transition-colors",
        isActive ? "border-sky-300 bg-sky-100/70" : "bg-card hover:bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              isActive
                ? "bg-sky-200 text-sky-800"
                : "bg-primary/10 text-primary",
            )}
          >
            {renderTaskIcon(task.type)}
          </div>

          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm font-medium",
                task.status === "Completed" &&
                  "line-through text-muted-foreground",
              )}
            >
              {task.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock size={12} />
              <span>
                {task.startDateTime
                  ? formatTaskDateTime(task.startDateTime, task.endDateTime)
                  : "Chưa có hạn"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionMenu
            actions={[
              { label: "Mở chi tiết", onClick: handleOpenTaskDetail },
              { label: "Chỉnh sửa", onClick: handleEditTask },
              {
                label:
                  task.status === "Completed"
                    ? "Đánh dấu đang làm"
                    : "Đánh dấu hoàn thành",
                onClick: handleToggleTaskStatus,
              },
              { label: "Xóa", onClick: handleDeleteTask },
            ]}
          />
          <Badge className={cn("border", statusStyle.badgeClass)}>
            {statusStyle.label}
          </Badge>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isActive && "translate-x-0.5 text-sky-700",
            )}
          />
        </div>
      </div>
    </div>
  );
}

function normalizeId(rawId: number | string) {
  const id = Number(rawId);
  return Number.isFinite(id) ? id : 0;
}
