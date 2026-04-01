import TaskInput from "@/components/features/course-workloads/components/TaskInput";
import TaskOutput from "@/components/features/course-workloads/components/TaskOutput";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useTask } from "@/hooks/entities/useTask";
import type { TaskStatus, TaskType } from "@/services/api";
import { toast } from "sonner";

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
              <span>{formatDate(task.taskDate)}</span>
              <span>•</span>
              <span>{getTaskTypeLabel(task.type)}</span>
            </div>
          </div>

          <Badge className={getStatusBadgeClass(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
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

function formatDate(value?: string | null) {
  if (!value) {
    return "Chưa có hạn";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa có hạn";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
    default:
      return String(type);
  }
}

function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case "Pending":
      return "Chờ xử lý";
    case "InProgress":
      return "Đang thực hiện";
    case "Completed":
      return "Hoàn thành";
    case "Cancelled":
      return "Đã hủy";
    case "Archived":
      return "Lưu trữ";
    default:
      return String(status);
  }
}

function getStatusBadgeClass(status: TaskStatus) {
  switch (status) {
    case "Pending":
      return "border border-amber-300 bg-amber-100 text-amber-800";
    case "InProgress":
      return "border border-blue-300 bg-blue-100 text-blue-800";
    case "Completed":
      return "border border-emerald-300 bg-emerald-100 text-emerald-800";
    case "Cancelled":
      return "border border-rose-300 bg-rose-100 text-rose-800";
    case "Archived":
      return "border border-slate-300 bg-slate-100 text-slate-700";
    default:
      return "border border-border bg-muted text-muted-foreground";
  }
}
