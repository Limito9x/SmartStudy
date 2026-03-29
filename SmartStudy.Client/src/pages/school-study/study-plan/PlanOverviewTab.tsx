import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourse } from "@/hooks/entities/useCourse";
import { useNavigate, useParams } from "react-router-dom";
import { useDialogStore } from "@/stores/useDialogStore";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import type { StudyPlanStatus } from "@/services/api";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import PlanOverviewCoursesTab from "./PlanOverviewCoursesTab";
import PlanOverviewStatsTab from "./PlanOverviewStatsTab";

type OverviewTabValue = "courses" | "stats";

const STATUS_LABEL: Record<StudyPlanStatus, string> = {
  Active: "Đang tiến hành",
  Completed: "Đã hoàn tất",
  Archived: "Đã lưu trữ",
};

const STATUS_BADGE_CLASS: Record<StudyPlanStatus, string> = {
  Active: "bg-lime-100 text-lime-900",
  Completed: "bg-emerald-100 text-emerald-900",
  Archived: "bg-slate-100 text-slate-700",
};

const toNumber = (value?: number | string | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPercent = (completed: number, total: number) => {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
};

const formatMonthYearRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return "Lịch học";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Lịch học";
  }

  return `${start.toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric",
  })} - ${end.toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric",
  })}`;
};

const getPlanTypeLabel = (type?: string) => {
  if (type === "Academic") return "Đại học";
  return "Cá nhân";
};

export default function PlanOverviewTab() {
  const { studyPlanId } = useParams();
  const planId = Number(studyPlanId);
  const navigate = useNavigate();
  const courseApi = useCourse({
    studyPlanId: planId,
  });
  const { openDialog, closeDialog } = useDialogStore();
  const [activeTab, setActiveTab] = useState<OverviewTabValue>("courses");
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);

  const { getStudyPlanById, getStudyPlanStats, updateStudyPlanStatus } =
    useStudyPlan();
  const {
    data: studyPlanData,
    isLoading: isPlanLoading,
    error: planError,
  } = getStudyPlanById(planId);
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = getStudyPlanStats(planId);

  const {
    data: courses,
    isLoading: isCoursesLoading,
    error: courseError,
  } = courseApi.getCourses;
  const deleteCourseMutation = courseApi.deleteCourse;

  const completedTasks = toNumber(stats?.completedTasks);
  const totalTasks = toNumber(stats?.totalTasks);
  const inProgressTasks = toNumber(stats?.inProgressTasks);
  const overdueTasks = toNumber(stats?.overdueTasks);
  const pendingTasks = toNumber(stats?.pendingTasks);
  const daysLeft = Math.max(0, toNumber(stats?.daysLeft));
  const totalStudyHours = toNumber(stats?.totalStudyHours);

  const overallPercent = toPercent(completedTasks, totalTasks);

  const canCompletePlan =
    !!studyPlanData &&
    studyPlanData.status === "Active" &&
    !updateStudyPlanStatus.isPending;

  const handleEditPlan = () => {
    if (!studyPlanData?.id) return;
    openDialog("STUDY_PLAN_FORM", {
      studyPlanId: Number(studyPlanData.id),
    });
  };

  const handleCompletePlan = () => {
    if (!planId) return;
    updateStudyPlanStatus.mutate(
      {
        path: { planId },
        body: { status: "Completed" },
      },
      {
        onSuccess: () => {
          setIsCompleteConfirmOpen(false);
        },
      },
    );
  };

  if (isPlanLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-105 w-full rounded-xl" />
      </div>
    );
  }

  if (planError || !studyPlanData) {
    return (
      <div className="p-4 text-sm text-destructive">
        Không thể tải kế hoạch học tập.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 pt-4 pb-3 sm:px-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-sky-100 text-sky-900 hover:bg-sky-100">
                {getPlanTypeLabel(studyPlanData.type)}
              </Badge>
              <Badge variant="outline">
                {formatMonthYearRange(
                  studyPlanData.startDate,
                  studyPlanData.endDate,
                )}
              </Badge>
              <Badge className={STATUS_BADGE_CLASS[studyPlanData.status]}>
                {STATUS_LABEL[studyPlanData.status]}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditPlan}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa kế hoạch
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canCompletePlan}
                  onClick={() => setIsCompleteConfirmOpen(true)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Hoàn tất KHHT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            {studyPlanData.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="shrink-0 text-sm text-slate-500">
              Tiến độ tổng thể
            </span>
            <Progress value={overallPercent} className="h-1.5 bg-slate-200" />
            <span className="w-12 text-right text-sm font-semibold text-slate-800">
              {overallPercent}%
            </span>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as OverviewTabValue)}
          className="gap-0"
        >
          <TabsList
            variant="line"
            className="h-auto rounded-none border-b px-4 sm:px-6"
          >
            <TabsTrigger
              value="courses"
              className="rounded-none px-2 py-3 text-sm"
            >
              <BookOpen className="h-4 w-4" />
              Khóa học
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-none px-2 py-3 text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="p-0">
            <PlanOverviewCoursesTab
              courses={courses}
              isLoading={isCoursesLoading}
              hasError={!!courseError}
              onAddCourse={() => {
                openDialog("COURSE_FORM", {
                  type: studyPlanData.type || "Personal",
                  studyPlanId: planId,
                });
              }}
              onEditCourse={(course) => {
                openDialog("COURSE_FORM", {
                  type: studyPlanData.type || "Personal",
                  courseId: Number(course.id),
                  studyPlanId: planId,
                });
              }}
              onDeleteCourse={(course) => {
                openDialog("CONFIRM_DELETE", {
                  itemType: "khoa hoc",
                  itemName: String(course.name),
                  onConfirm: () => {
                    deleteCourseMutation.mutate({
                      path: {
                        courseId: Number(course.id),
                      },
                    });
                    closeDialog();
                  },
                });
              }}
              onViewCourse={(course) =>
                navigate(
                  `/app/study-plans/${studyPlanData.id}/courses/${course.id}`,
                )
              }
            />
          </TabsContent>

          <TabsContent value="stats" className="p-0">
            <PlanOverviewStatsTab
              isLoading={isStatsLoading}
              hasError={!!statsError}
              overallPercent={overallPercent}
              completedTasks={completedTasks}
              inProgressTasks={inProgressTasks}
              overdueTasks={overdueTasks}
              pendingTasks={pendingTasks}
              totalTasks={totalTasks}
              daysLeft={daysLeft}
              totalStudyHours={totalStudyHours}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isCompleteConfirmOpen}
        onOpenChange={setIsCompleteConfirmOpen}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Hoàn tất kế hoạch học tập</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đánh dấu kế hoạch "{studyPlanData.name}" là
              đã hoàn tất không?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCompleteConfirmOpen(false)}
              disabled={updateStudyPlanStatus.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCompletePlan}
              disabled={updateStudyPlanStatus.isPending}
            >
              {updateStudyPlanStatus.isPending
                ? "Đang cập nhật..."
                : "Hoàn tất KHHT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
