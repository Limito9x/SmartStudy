import { Skeleton } from "@/components/ui/skeleton";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface PlanOverviewStatsTabProps {
  isLoading: boolean;
  hasError: boolean;
  overallPercent: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  totalTasks: number;
  daysLeft: number;
  totalStudyHours: number;
}

const STATS_COLORS = {
  completed: "#1f9d70",
  inProgress: "#f59e0b",
  overdue: "#ef4444",
  pending: "#6b7280",
};

export default function PlanOverviewStatsTab({
  isLoading,
  hasError,
  overallPercent,
  completedTasks,
  inProgressTasks,
  overdueTasks,
  pendingTasks,
  totalTasks,
  daysLeft,
  totalStudyHours,
}: PlanOverviewStatsTabProps) {
  const donutData = [
    {
      key: "completed",
      label: "Hoàn thành",
      value: completedTasks,
      color: STATS_COLORS.completed,
    },
    {
      key: "inProgress",
      label: "Đang làm",
      value: inProgressTasks,
      color: STATS_COLORS.inProgress,
    },
    {
      key: "overdue",
      label: "Quá hạn",
      value: overdueTasks,
      color: STATS_COLORS.overdue,
    },
    {
      key: "pending",
      label: "Chờ",
      value: pendingTasks,
      color: STATS_COLORS.pending,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3 px-4 py-4 sm:px-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="px-4 py-4 sm:px-6">
        <p className="py-6 text-sm text-destructive">
          Không thể tải thống kê kế hoạch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4 sm:px-6">
      <div className="grid gap-4 md:grid-cols-[260px_1fr] md:items-center">
        <div className="mx-auto h-55 w-55">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={82}
                paddingAngle={2}
              >
                {donutData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none -mt-54 flex h-55 flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-slate-900">
              {overallPercent}%
            </p>
            <p className="text-xs text-slate-500">xong</p>
          </div>
        </div>

        <div className="space-y-2">
          {donutData.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-stone-100 px-4 py-3">
          <p className="text-xs text-slate-600">Tổng task</p>
          <p className="text-3xl font-semibold text-slate-900">{totalTasks}</p>
        </div>
        <div className="rounded-lg bg-stone-100 px-4 py-3">
          <p className="text-xs text-slate-600">Còn lại</p>
          <p className="text-3xl font-semibold text-slate-900">
            {daysLeft} ngày
          </p>
        </div>
        <div className="rounded-lg bg-stone-100 px-4 py-3">
          <p className="text-xs text-slate-600">Tổng giờ học</p>
          <p className="text-3xl font-semibold text-slate-900">
            {totalStudyHours}h
          </p>
        </div>
      </div>
    </div>
  );
}
