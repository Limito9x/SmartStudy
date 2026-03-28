import TodayKpiSection from "@/components/features/main/TodayKpiSection";
import TodayTasksSection from "@/components/features/main/TodayTasksSection";
import TodayUpcomingEventsSection from "@/components/features/main/TodayUpcomingEventsSection";
import { useCalendar } from "@/hooks/entities/useCalendar";
import { useDashboard } from "@/hooks/entities/useDashboard";
import { useTask } from "@/hooks/entities/useTask";
import { useDialogStore } from "@/stores/useDialogStore";
import { getStudentDashboardSummaryQueryKey } from "@/services/api/@tanstack/react-query.gen";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import type { TodayTaskDto } from "@/services/api";

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    from: format(monday, "yyyy-MM-dd"),
    to: format(sunday, "yyyy-MM-dd"),
  };
}

function normalizeStartTime(time?: string | null) {
  if (!time) return "19:00:00";

  if (time.includes("T")) {
    const date = new Date(time);
    if (!Number.isNaN(date.getTime())) {
      return format(date, "HH:mm:ss");
    }
  }

  const [hour = "00", minute = "00", second = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
}

export default function TodayPage() {
  const queryClient = useQueryClient();
  const { openDialog } = useDialogStore();
  const { getDashboardSummary } = useDashboard();
  const { updateTaskStatus } = useTask();
  const currentRange = getCurrentWeekRange();
  const { rescheduleCalendar } = useCalendar(currentRange);

  const { data: summary, isLoading } = getDashboardSummary;
  const overdueTasks = summary?.overdueTasks ?? [];
  const todayTasks = summary?.todayTasks ?? [];
  const completedTasks = summary?.completedTasks ?? [];
  const upcomingEvents = summary?.upcomingEvents ?? [];

  const refreshDashboard = () => {
    queryClient.invalidateQueries({
      queryKey: getStudentDashboardSummaryQueryKey(),
    });
  };

  const handleCompleteTask = (task: TodayTaskDto) => {
    const taskId = Number(task.id);
    if (!task.id || Number.isNaN(taskId)) {
      toast.error("Không thể thực hiện thao tác cho nhiệm vụ này");
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
        onError: () => {
          toast.error("Không thể cập nhật trạng thái công việc");
        },
      },
    );
  };

  const handleLogWork = (task: TodayTaskDto) => {
    const taskId = Number(task.id);
    if (!task.id || Number.isNaN(taskId)) {
      toast.error("Không thể ghi log cho nhiệm vụ này");
      return;
    }

    openDialog("LOG_WORK_FORM", {
      taskId,
      defaultValues: {
        files: [],
        actualDuration: Number(task.plannedDuration) || 60,
        note: "",
        markAsCompleted: false,
      },
    });
  };

  const handleRescheduleTask = (
    task: TodayTaskDto,
    group: "overdue" | "today",
  ) => {
    const taskId = Number(task.id);
    if (!task.id || Number.isNaN(taskId)) {
      toast.error("Không thể dời nhiệm vụ này");
      return;
    }

    const targetDate =
      group === "overdue" ? new Date() : addDays(new Date(), 1);

    rescheduleCalendar.mutate(
      {
        body: {
          taskId,
          newDate: format(targetDate, "yyyy-MM-dd"),
          newStartTime: normalizeStartTime(task.startTime),
          newDuration: Number(task.plannedDuration) || 60,
        },
      },
      {
        onSuccess: () => {
          refreshDashboard();
          toast.success(`Đã dời ${task.name ?? "nhiệm vụ"}`);
        },
        onError: () => {
          toast.error("Không thể dời công việc");
        },
      },
    );
  };

  return (
    <div className="h-full space-y-4 overflow-y-auto p-4">
      <TodayKpiSection summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TodayTasksSection
          overdueTasks={overdueTasks}
          todayTasks={todayTasks}
          completedTasks={completedTasks}
          onComplete={handleCompleteTask}
          onLogWork={handleLogWork}
          onReschedule={handleRescheduleTask}
          isCompleting={updateTaskStatus.isPending}
          isRescheduling={rescheduleCalendar.isPending}
        />
        <TodayUpcomingEventsSection events={upcomingEvents} />
      </div>
    </div>
  );
}
