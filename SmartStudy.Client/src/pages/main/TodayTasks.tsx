import { useMemo, useState } from "react";
import { useTask } from "@/hooks/entities/useTask";
import { useDialogStore } from "@/stores/useDialogStore";
import { LogWorkForm } from "@/components/forms/log/LogWorkForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
} from "lucide-react";
import type { ResponseTaskDto, TaskStatus } from "@/services/api";

const typeLabel: Record<string, string> = {
  ClassSession: "Tiết học",
  SelfStudy: "Tự học",
  AssignmentWork: "Bài tập",
  Meeting: "Họp",
};

const statusLabel: Record<TaskStatus, string> = {
  Pending: "Chờ",
  InProgress: "Đang làm",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const statusBadgeVariant: Record<
  TaskStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Pending: "secondary",
  InProgress: "default",
  Completed: "outline",
  Cancelled: "destructive",
};

function formatTime(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1) return null;
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function TodayTasks() {
  const { getTasks, updateTaskStatus, createTaskLogWork } = useTask();
  const { openDialog, closeDialog } = useDialogStore();
  const [completedOpen, setCompletedOpen] = useState(false);

  const { from, to } = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    return {
      from: `${dateStr}T00:00:00`,
      to: `${dateStr}T23:59:59`,
    };
  }, []);

  const { data: tasks } = getTasks({ from, to });

  const activeTasks =
    tasks?.filter((t) => t.status === "Pending" || t.status === "InProgress") ??
    [];

  const doneTasks =
    tasks?.filter(
      (t) => t.status === "Completed" || t.status === "Cancelled",
    ) ?? [];

  const handleComplete = (task: ResponseTaskDto) => {
    updateTaskStatus.mutate({
      path: { taskId: task.id },
      body: { status: "Completed" },
    });
  };

  const handleLogWork = (task: ResponseTaskDto) => {
    openDialog("LOG_WORK_FORM", {
      taskId: Number(task.id),
      defaultValues: {
        actualDuration: Number(task.plannedDuration) || 60,
        note: "",
        markAsCompleted: false,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList size={18} className="text-primary" />
          Công việc hôm nay
        </h2>
        {tasks && (
          <span className="text-sm text-muted-foreground">
            {activeTasks.length} đang chờ
          </span>
        )}
      </div>

      {/* Active tasks */}
      {activeTasks.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Không có công việc nào hôm nay 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeTasks.map((task) => {
            const start = formatTime(task.startTime);
            const end = formatTime(
              task.startTime
                ? new Date(
                    new Date(task.startTime).getTime() +
                      (Number(task.plannedDuration) || 60) * 60 * 1000,
                  ).toISOString()
                : null,
            );
            return (
              <div
                key={task.id}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3"
              >
                {/* Top */}
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-green-500 mt-0.5"
                    title="Đánh dấu hoàn thành"
                    onClick={() => handleComplete(task)}
                  >
                    <CheckCircle2 size={16} />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug">
                      {task.name}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-xs gap-1"
                    onClick={() => handleLogWork(task)}
                  >
                    <FileText size={12} />
                    Log
                  </Button>
                </div>

                {/* Bottom meta */}
                <div className="flex items-center gap-2 flex-wrap pl-9">
                  <Badge
                    variant={statusBadgeVariant[task.status]}
                    className="text-xs h-5"
                  >
                    {statusLabel[task.status]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs h-5">
                    {typeLabel[task.type] ?? task.type}
                  </Badge>
                  {(start || end) && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {start}
                      {end ? ` – ${end}` : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed section */}
      {doneTasks.length > 0 && (
        <div className="space-y-2">
          <button
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
            onClick={() => setCompletedOpen((o) => !o)}
          >
            {completedOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            Đã hoàn thành
            <Badge variant="secondary" className="h-5 text-xs">
              {doneTasks.length}
            </Badge>
          </button>

          {completedOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-2 opacity-70"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-green-500 mt-0.5"
                    />
                    <p className="text-sm font-medium line-through text-muted-foreground leading-snug">
                      {task.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pl-6">
                    <Badge
                      variant={statusBadgeVariant[task.status]}
                      className="text-xs h-5"
                    >
                      {statusLabel[task.status]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs h-5">
                      {typeLabel[task.type] ?? task.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
