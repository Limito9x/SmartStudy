import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskType, TodayTaskDto } from "@/services/api";

const taskTypeLabel: Record<TaskType, string> = {
  ClassSession: "Buổi học",
  SelfStudy: "Tự học",
  AssignmentWork: "Bài tập",
  Meeting: "Họp",
};

const taskActionLabel: Record<TaskType, string> = {
  ClassSession: "Ghi lại buổi học",
  SelfStudy: "Bắt đầu học",
  AssignmentWork: "Hoàn thành",
  Meeting: "Đã tham dự",
};

interface TodayTasksSectionProps {
  overdueTasks: TodayTaskDto[];
  todayTasks: TodayTaskDto[];
  onAction: (task: TodayTaskDto) => void;
  isActionLoading: boolean;
}

function TaskGroup({
  title,
  tasks,
  titleClassName,
  onAction,
  isActionLoading,
}: {
  title: string;
  tasks: TodayTaskDto[];
  titleClassName?: string;
  onAction: (task: TodayTaskDto) => void;
  isActionLoading: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className={`text-sm font-semibold ${titleClassName ?? ""}`}>
          {title}
        </h3>
        <div className="h-px flex-1 bg-border" />
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
          Không có dữ liệu.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task, index) => {
            const taskType = task.type;
            const actionLabel = taskType
              ? taskActionLabel[taskType]
              : "Thao tác";
            const badgeLabel = taskType ? taskTypeLabel[taskType] : "Khác";

            return (
              <div
                key={`${task.id ?? "task"}-${index}`}
                className="rounded-md border px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {task.name ?? "Chưa đặt tên"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {task.startTime?.split(":").slice(0, 2).join(":")}
                    </p>
                  </div>
                  <Badge variant="secondary">{badgeLabel}</Badge>
                </div>

                <Button
                  size="sm"
                  className="mt-2.5 w-full"
                  onClick={() => onAction(task)}
                  disabled={isActionLoading}
                >
                  {actionLabel}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TodayTasksSection({
  overdueTasks,
  todayTasks,
  onAction,
  isActionLoading,
}: TodayTasksSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Công việc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <TaskGroup
          title="Việc quá hạn"
          titleClassName="text-rose-600"
          tasks={overdueTasks}
          onAction={onAction}
          isActionLoading={isActionLoading}
        />

        <TaskGroup
          title="Việc hôm nay"
          tasks={todayTasks}
          onAction={onAction}
          isActionLoading={isActionLoading}
        />
      </CardContent>
    </Card>
  );
}
