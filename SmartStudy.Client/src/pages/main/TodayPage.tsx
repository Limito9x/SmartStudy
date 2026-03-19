import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/entities/useDashboard";
import { useTask } from "@/hooks/entities/useTask";
import { LogWorkForm } from "@/components/forms/log/LogWorkForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { useChatDrawerStore } from "@/stores/useChatDrawerStore";
import { getStudentDashboardSummaryQueryKey } from "@/services/api/@tanstack/react-query.gen";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  DashboardSummaryDto,
  TaskType,
  TodayTaskDto,
  UpcomingEventDto,
} from "@/services/api";

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

function asNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDecimal(
  value: number | string | null | undefined,
  fractionDigits = 1,
): string {
  return asNumber(value).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

function formatPercent(value: number | string | null | undefined): string {
  return `${formatDecimal(value, 0)}%`;
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayMonth(value: string | null | undefined): {
  day: string;
  month: string;
} {
  if (!value) return { day: "--", month: "--" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "--" };

  return {
    day: date.toLocaleDateString("vi-VN", { day: "2-digit" }),
    month: date.toLocaleDateString("vi-VN", { month: "2-digit" }),
  };
}

function Delta({ value, unit }: { value: number; unit: string }) {
  if (value === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Không đổi so với tuần trước
      </p>
    );
  }

  const isUp = value > 0;
  const formatted = Math.abs(value).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <p
      className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-600" : "text-rose-600"}`}
    >
      {isUp ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {formatted}
      {unit} so với tuần trước
    </p>
  );
}

function TaskListSection({
  title,
  titleClassName,
  tasks,
  onAction,
  isActionLoading,
}: {
  title: string;
  titleClassName?: string;
  tasks: Array<TodayTaskDto>;
  onAction: (task: TodayTaskDto) => void;
  isActionLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className={`text-base ${titleClassName ?? ""}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Không có dữ liệu.
          </div>
        ) : (
          tasks.map((task, index) => {
            const taskType = task.type;
            const actionLabel = taskType
              ? taskActionLabel[taskType]
              : "Thao tác";
            const badgeLabel = taskType ? taskTypeLabel[taskType] : "Khác";

            return (
              <div
                key={`${task.id ?? "task"}-${index}`}
                className="rounded-md border p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {task.name ?? "Chưa đặt tên"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatTime(task.startTime)}
                    </p>
                  </div>
                  <Badge variant="secondary">{badgeLabel}</Badge>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onAction(task)}
                  disabled={isActionLoading}
                >
                  {actionLabel}
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingEventsSection({
  events,
}: {
  events: Array<UpcomingEventDto>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sự kiện sắp tới</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Không có sự kiện sắp tới.
          </div>
        ) : (
          events.map((event, index) => {
            const { day, month } = formatDayMonth(event.dueDate);
            const daysUntil = asNumber(event.daysUntil);
            const urgent = daysUntil < 7;

            return (
              <div
                key={`${event.id ?? "event"}-${index}`}
                className="rounded-md border p-3 flex items-start gap-3"
              >
                <div className="w-12 h-12 rounded-md border flex flex-col items-center justify-center shrink-0 bg-muted">
                  <span className="text-sm font-semibold leading-none">
                    {day}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-none mt-1">
                    /{month}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {event.title ?? "Sự kiện"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {event.courseName ?? "Không có môn học"}
                  </p>
                  <p
                    className={`text-xs mt-1 font-medium ${urgent ? "text-rose-600" : "text-muted-foreground"}`}
                  >
                    Còn {Math.max(daysUntil, 0)} ngày
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function TodayPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openDialog, closeDialog } = useDialogStore();
  const { open: openChatDrawer } = useChatDrawerStore();
  const { getDashboardSummary } = useDashboard();
  const { createTaskLogWork, updateTaskStatus } = useTask();

  const { data: summary, isLoading } = getDashboardSummary;
  
  // const { data: insight } = getDashboardInsight;

  const overdueTasks = useMemo(() => summary?.overdueTasks ?? [], [summary]);
  const todayTasks = useMemo(() => summary?.todayTasks ?? [], [summary]);
  const upcomingEvents = useMemo(
    () => summary?.upcomingEvents ?? [],
    [summary],
  );

  const handleOpenAI = () => {
    openChatDrawer();
    navigate("/app");
  };

  const refreshDashboard = () => {
    queryClient.invalidateQueries({
      queryKey: getStudentDashboardSummaryQueryKey(),
    });
  };

  const handleTaskAction = (task: TodayTaskDto) => {
    const taskId = Number(task.id);
    if (!task.id || Number.isNaN(taskId)) {
      toast.error("Không thể thực hiện thao tác cho nhiệm vụ này");
      return;
    }

    if (task.type === "ClassSession" || task.type === "SelfStudy") {
      openDialog({
        title: `Ghi nhận: ${task.name ?? "Nhiệm vụ"}`,
        view: (
          <LogWorkForm
            onSubmit={(data) => {
              createTaskLogWork.mutate(
                {
                  path: { taskId },
                  body: {
                    note: data.note ?? null,
                    actualDurationMinutes: data.actualDurationMinutes ?? null,
                    comprehensionLevel: data.comrehensiveLevel ?? null,
                    difficultyLevel: data.difficultyLevel ?? null,
                    timerStartAt: data.timerStartAt ?? null,
                    timerEndAt: data.timerEndAt ?? null,
                    eventRequirementId: data.eventRequirementId ?? null,
                    earnedValue: data.earnedValue ?? null,
                    assetIds: data.assetIds ?? null,
                    markAsCompleted: data.markAsCompleted ?? false,
                  },
                },
                {
                  onSuccess: () => {
                    closeDialog();
                    refreshDashboard();
                    toast.success(`Đã ghi nhận ${task.name ?? "nhiệm vụ"}`);
                  },
                },
              );
            }}
          />
        ),
      });
      return;
    }

    updateTaskStatus.mutate(
      {
        path: { taskId },
        body: { status: "Completed" },
      },
      {
        onSuccess: () => {
          refreshDashboard();
          toast.success(`Đã hoàn thành ${task.name ?? "nhiệm vụ"}`);
        },
      },
    );
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Giờ học tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatDecimal(summary?.weeklyStudyHours)}h
            </p>
            <Delta value={asNumber(summary?.hoursDelta)} unit="h" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Năng suất tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatDecimal(summary?.weeklyProductivity, 0)}%
            </p>
            <Delta value={asNumber(summary?.productivityDelta)} unit="%" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Tỷ lệ hoàn thành tuần
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatPercent(summary?.weeklyCompletionRate)}
            </p>
            <p className="text-xs text-muted-foreground">
              Dựa trên nhiệm vụ đã hoàn tất
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Kế hoạch hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {Math.max(asNumber(summary?.daysLeftInPlan), 0)} ngày
            </p>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {summary?.currentPlanName ?? "Chưa có kế hoạch"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {/* {insight} */}
              Hỏi AI để có những gợi ý giúp bạn cải thiện hiệu quả học tập nhé!
            </p>
          )}
          <Button size="sm" onClick={handleOpenAI}>
            <Sparkles className="h-4 w-4 mr-1" />
            Hỏi thêm AI
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TaskListSection
            title="Việc quá hạn"
            titleClassName="text-rose-600"
            tasks={overdueTasks}
            onAction={handleTaskAction}
            isActionLoading={
              createTaskLogWork.isPending || updateTaskStatus.isPending
            }
          />
          <TaskListSection
            title="Việc hôm nay"
            tasks={todayTasks}
            onAction={handleTaskAction}
            isActionLoading={
              createTaskLogWork.isPending || updateTaskStatus.isPending
            }
          />
        </div>

        <div>
          <UpcomingEventsSection events={upcomingEvents} />
          <Card className="mt-4">
            <CardContent className="pt-6 text-xs text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Mẹo: Sự kiện dưới 7 ngày sẽ được đánh dấu đỏ để bạn ưu tiên chuẩn
              bị.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
