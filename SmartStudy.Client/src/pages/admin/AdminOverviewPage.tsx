import {
  useGetKpi,
  useGetUserGrowth,
  useGetBehavior,
} from "@/hooks/entities/useAdminDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Clock, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const KPI_CARDS = [
  {
    key: "totalUsers",
    label: "Tổng người dùng",
    icon: Users,
    color: "text-blue-500",
  },
  {
    key: "activeUsersThisWeek",
    label: "Người dùng hoạt động",
    icon: Activity,
    color: "text-green-500",
  },
  {
    key: "totalSystemHours",
    label: "Tổng giờ học",
    icon: Clock,
    color: "text-orange-500",
  },
  {
    key: "totalCompletedTasks",
    label: "Nhiệm vụ hoàn thành",
    icon: CheckCircle,
    color: "text-purple-500",
  },
];

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const TASK_TYPE_TRANSLATIONS: Record<string, string> = {
  ClassSession: "Buổi học",
  SelfStudy: "Tự học",
  AssignmentWork: "Bài tập",
  Meeting: "Cuộc họp",
  Milestone: "Cột mốc",
};

const getTaskTypeLabel = (taskType: string): string => {
  return TASK_TYPE_TRANSLATIONS[taskType] || taskType;
};

const formatDateShort = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    // Handle ISO string format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
    let date: Date;

    if (
      dateString.includes("T") ||
      dateString.includes("/") ||
      dateString.includes("-")
    ) {
      date = new Date(dateString);
    } else {
      return dateString;
    }

    if (isNaN(date.getTime())) {
      return dateString;
    }

    // Format as d/m for compact display
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  } catch (error) {
    console.error("Date formatting error:", error, dateString);
    return dateString || "N/A";
  }
};

export default function AdminOverviewPage() {
  const { data: kpiData, isLoading: kpiLoading } = useGetKpi();
  const { data: growthData, isLoading: growthLoading } = useGetUserGrowth();
  const { data: behaviorData, isLoading: behaviorLoading } = useGetBehavior();

  // Format growth data for chart
  const chartGrowthData =
    growthData?.map((item) => ({
      date: formatDateShort(item.date || ""),
      newUsers: Number(item.newUsers) || 0,
    })) || [];

  // Format behavior data for chart
  const chartBehaviorData =
    behaviorData?.map((item) => ({
      taskType: getTaskTypeLabel(item.taskType || "Unknown"),
      totalHours: Number(item.totalHours) || 0,
    })) || [];

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tổng quan Admin</h1>
        <p className="text-muted-foreground mt-1">
          Những thông tin quan trọng về hệ thống
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          const value = kpiData?.[card.key as keyof typeof kpiData];
          const displayValue =
            card.key === "totalSystemHours"
              ? `${Number(value || 0).toFixed(1)}h`
              : value || 0;

          return (
            <Card key={card.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between pt-0">
                <div>
                  {kpiLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{displayValue}</div>
                  )}
                </div>
                <Icon className={`h-8 w-8 ${card.color} opacity-70`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng mới</CardTitle>
            <CardDescription>Số lượng người dùng mới theo ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {growthLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartGrowthData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Người dùng mới"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Behavior Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ thời gian học</CardTitle>
            <CardDescription>Thời gian học theo loại nhiệm vụ</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {behaviorLoading ? (
              <Skeleton className="h-full w-full" />
            ) : chartBehaviorData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartBehaviorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ taskType, totalHours }) =>
                      `${taskType}: ${totalHours}h`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalHours"
                  >
                    {chartBehaviorData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}h`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
