import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResponseTaskDto, TaskStatus, TaskType } from "@/services/api";
import type { PanelDataMap } from "@/stores/usePanelStore";
import { usePanelStore } from "@/stores/usePanelStore";
import {
  CalendarClock,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Handshake,
  Notebook,
} from "lucide-react";
import { formatTaskDateTime } from "@/utils/dateUtils";

interface CourseTaskCardProps {
  taskData: ResponseTaskDto;
}

export default function CourseTaskCard({ taskData }: CourseTaskCardProps) {
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

function renderTaskIcon(type: TaskType) {
  switch (type) {
    case "ClassSession":
      return <GraduationCap size={16} />;
    case "SelfStudy":
      return <Notebook size={16} />;
    case "AssignmentWork":
      return <ClipboardList size={16} />;
    case "Meeting":
      return <Handshake size={16} />;
    default:
      return <Notebook size={16} />;
  }
}

function getStatusStyle(status: TaskStatus) {
  switch (status) {
    case "Pending":
      return {
        label: "Chờ xử lý",
        badgeClass:
          "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100",
      };
    case "InProgress":
      return {
        label: "Đang thực hiện",
        badgeClass:
          "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
      };
    case "Completed":
      return {
        label: "Hoàn thành",
        badgeClass:
          "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
      };
    case "Cancelled":
      return {
        label: "Đã hủy",
        badgeClass:
          "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-100",
      };
    default:
      return {
        label: String(status),
        badgeClass: "bg-muted text-muted-foreground border-border",
      };
  }
}
