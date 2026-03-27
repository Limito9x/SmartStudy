import TodayKpiSection from "@/components/features/main/TodayKpiSection";
import TodayTasksSection from "@/components/features/main/TodayTasksSection";
import TodayUpcomingEventsSection from "@/components/features/main/TodayUpcomingEventsSection";
import { useDashboard } from "@/hooks/entities/useDashboard";
import { useTask } from "@/hooks/entities/useTask";
import { useDialogStore } from "@/stores/useDialogStore";
import { getStudentDashboardSummaryQueryKey } from "@/services/api/@tanstack/react-query.gen";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TodayTaskDto } from "@/services/api";

export default function TodayPage() {
  const queryClient = useQueryClient();
  const { openDialog } = useDialogStore();
  const { getDashboardSummary } = useDashboard();
  const { createTaskLogWork, updateTaskStatus } = useTask();

  const { data: summary, isLoading } = getDashboardSummary;
  const overdueTasks = summary?.overdueTasks ?? [];
  const todayTasks = summary?.todayTasks ?? [];
  const upcomingEvents = summary?.upcomingEvents ?? [];

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
      openDialog("LOG_WORK_FORM", {
        taskId: taskId,
        defaultValues: {
          files: [],
          actualDuration: Number(task.plannedDuration) || 60,
          note: "",
          markAsCompleted: false,
        },
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
    <div className="h-full space-y-4 overflow-y-auto p-4">
      <TodayKpiSection summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TodayTasksSection
          overdueTasks={overdueTasks}
          todayTasks={todayTasks}
          onAction={handleTaskAction}
          isActionLoading={
            createTaskLogWork.isPending || updateTaskStatus.isPending
          }
        />
        <TodayUpcomingEventsSection events={upcomingEvents} />
      </div>
    </div>
  );
}
