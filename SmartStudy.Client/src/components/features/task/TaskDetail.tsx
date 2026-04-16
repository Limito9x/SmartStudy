import TaskInput from "@/components/features/course-workloads/components/TaskInput";
import TaskOutput from "@/components/features/course-workloads/components/TaskOutput";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useTask } from "@/hooks/entities/useTask";
import type { TaskType } from "@/services/api";
import { formatTaskDateTime } from "@/utils/dateUtils";
import { toast } from "sonner";
import { getStatusStyle, resolveTaskDisplayStatus } from "./FormatTask";

interface TaskDetailProps {
  taskId: number;
}

export default function TaskDetail({ taskId }: TaskDetailProps) {
  const { getTaskDetailById, updateTaskStatus } = useTask();
  const { data, isLoading, error } = getTaskDetailById(taskId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tải chi tiết task";
    return <p className="p-4 text-sm text-destructive">{message}</p>;
  }

  const task = data?.task;
  if (!task) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Không tìm thấy dữ liệu công việc.
      </p>
    );
  }

  const isCompleted = task.status === "Completed";
  const statusStyle = getStatusStyle(resolveTaskDisplayStatus(task));
  const normalizedTaskId = Number(task.id);

  const handleToggleCompleted = (checked: boolean) => {
    if (!Number.isFinite(normalizedTaskId)) {
      toast.error("Không thể cập nhật trạng thái công việc");
      return;
    }

    updateTaskStatus.mutate(
      {
        path: { taskId: normalizedTaskId },
        body: {
          status: checked ? "Completed" : "InProgress",
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật trạng thái công việc");
        },
        onError: () => {
          toast.error("Không thể cập nhật trạng thái công việc");
        },
      },
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b bg-muted/30 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-base font-semibold">{task.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                {formatTaskDateTime(task.startDateTime, task.endDateTime)}
              </span>
              <span>•</span>
              <span>{getTaskTypeLabel(task.type)}</span>
            </div>
          </div>

          <Badge className={statusStyle.badgeClass}>{statusStyle.label}</Badge>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            Đánh dấu hoàn thành
          </span>
          <Switch
            checked={isCompleted}
            onCheckedChange={handleToggleCompleted}
            disabled={updateTaskStatus.isPending}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <TaskInput taskId={normalizedTaskId} docs={data?.docs ?? []} />
          <TaskOutput taskId={normalizedTaskId} logs={data?.logs ?? []} />
        </div>
      </div>
    </div>
  );
}

function getTaskTypeLabel(type: TaskType) {
  switch (type) {
    case "ClassSession":
      return "Buổi học";
    case "SelfStudy":
      return "Tự học";
    case "AssignmentWork":
      return "Bài tập";
    case "Meeting":
      return "Cuộc họp";
    case "Milestone":
      return "Cột mốc";
    default:
      return String(type);
  }
}
