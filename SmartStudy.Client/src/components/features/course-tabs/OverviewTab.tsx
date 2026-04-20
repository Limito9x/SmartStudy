import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import InlineEditableInput from "@/components/shared/InlineEditableInput";
import CourseCompletionForm from "@/components/features/course-tabs/CourseCompletionForm";
import { useCourse } from "@/hooks/entities/useCourse";
import { useDialogStore } from "@/stores/useDialogStore";
import type {
  CoursePhaseWorkloadDto,
  CourseStatus,
  ResponseCourseDto,
  ResponseTaskDto,
  SimpleResponseRoutineDto,
  StudyPlanType,
} from "@/services/api";
import {
  clampPercentage,
  COURSE_STATUS_BADGE_CLASS,
  COURSE_STATUS_LABELS,
  formatDayMonth,
  getCountdownClassName,
  getCountdownText,
  getDaysLeft,
  getRoutineTaskTypeLabel,
  hexToRgba,
  normalizeHexColor,
  stringifyNullable,
  toNumber,
} from "@/utils/courseOverviewUtils";
import { weekdayMap } from "@/utils/dateUtils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

interface OverviewTabProps {
  course: ResponseCourseDto | null | undefined;
  courseId: number;
  studyPlanId: number;
  studyPlanType: StudyPlanType;
  workloadPhases: CoursePhaseWorkloadDto[];
  isWorkloadLoading: boolean;
}

export default function OverviewTab({
  course,
  courseId,
  studyPlanId,
  studyPlanType,
  workloadPhases,
  isWorkloadLoading,
}: OverviewTabProps) {
  const { openDialog } = useDialogStore();
  const {
    updateCourseStatus,
    updateCourseTargetScore,
    updateCourseFinalScore,
    updateCourseGoal,
    deleteCourse,
  } = useCourse({ studyPlanId });

  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  const courseColor = normalizeHexColor(course?.color) ?? "#3b82f6";
  const progressValue = clampPercentage(toNumber(course?.progress));
  const targetScoreValue = stringifyNullable(course?.targetScore);
  const finalScoreValue = stringifyNullable(course?.finalScore);
  const totalCompleted = toNumber(course?.totalCompletions);
  const estimatedTotal = toNumber(course?.totalExpectations);
  const status = (course?.status ?? "Enrolled") as CourseStatus;
  const completionPending =
    updateCourseFinalScore.isPending || updateCourseStatus.isPending;

  const upcomingMilestones = useMemo(() => {
    const mapped = (workloadPhases ?? []).flatMap((phase) =>
      (phase.tasks ?? [])
        .filter((task) => {
          if (task.type !== "Milestone") {
            return false;
          }

          if (
            task.status === "Completed" ||
            task.status === "Cancelled" ||
            task.status === "Archived"
          ) {
            return false;
          }

          const dueDate = task.endDateTime ?? task.startDateTime;
          const daysLeft = getDaysLeft(dueDate);
          return daysLeft === null || daysLeft >= 0;
        })
        .map((task) => ({
          task,
          phaseTitle: phase.title,
        })),
    );

    return mapped.sort((a, b) => {
      const dueA = parseDateValue(a.task.endDateTime ?? a.task.startDateTime);
      const dueB = parseDateValue(b.task.endDateTime ?? b.task.startDateTime);

      if (dueA && dueB) {
        return dueA.getTime() - dueB.getTime();
      }
      if (dueA) {
        return -1;
      }
      if (dueB) {
        return 1;
      }
      return 0;
    });
  }, [workloadPhases]);

  const routines = useMemo(() => {
    const flattened = (workloadPhases ?? []).flatMap((phase) =>
      (phase.routines ?? [])
        .map((courseRoutine) => courseRoutine.routine)
        .filter((routine): routine is SimpleResponseRoutineDto =>
          Boolean(routine),
        ),
    );

    const routineMap = new Map<number, SimpleResponseRoutineDto>();
    for (const routine of flattened) {
      const id = toNumber(routine.id);
      if (id <= 0 || routineMap.has(id)) {
        continue;
      }
      routineMap.set(id, routine);
    }

    return Array.from(routineMap.values());
  }, [workloadPhases]);

  const handleSaveTargetScore = async (nextValue: string) => {
    const trimmed = nextValue.trim();
    const numeric = Number(trimmed);

    if (!trimmed || Number.isNaN(numeric)) {
      toast.error("Vui lòng nhập điểm mục tiêu hợp lệ.");
      throw new Error("Điểm mục tiêu không hợp lệ");
    }

    if (trimmed === targetScoreValue) {
      return;
    }

    try {
      await updateCourseTargetScore.mutateAsync({
        path: { courseId },
        body: numeric,
      });
      toast.success("Đã cập nhật mục tiêu điểm.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật mục tiêu.";
      toast.error(message);
      throw error;
    }
  };

  const handleSaveGoal = async (nextValue: string) => {
    const trimmed = nextValue.trim();
    const currentGoal = String(course?.goal ?? "").trim();

    if (trimmed === currentGoal) {
      return;
    }

    try {
      await updateCourseGoal.mutateAsync({
        path: { courseId },
        body: trimmed,
      });
      toast.success("Đã cập nhật mục tiêu khóa học.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật mục tiêu khóa học.";
      toast.error(message);
      throw error;
    }
  };

  const handleOpenEditCourse = () => {
    openDialog("COURSE_FORM", {
      type: studyPlanType,
      studyPlanId,
      courseId,
    });
  };

  const handleOpenDeleteCourse = () => {
    openDialog("CONFIRM_DELETE", {
      itemType: "khóa học",
      itemName: String(course?.name ?? "Khóa học"),
      onConfirm: () => {
        deleteCourse.mutate(
          {
            path: { courseId },
          },
          {
            onSuccess: () => {
              toast.success("Đã xóa khóa học.");
            },
            onError: (error) => {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể xóa khóa học.";
              toast.error(message);
            },
          },
        );
      },
    });
  };

  const handleCompleteCourse = (finalScore: number) => {
    if (Number.isNaN(finalScore)) {
      toast.error("Vui lòng nhập điểm tổng kết hợp lệ.");
      return;
    }

    updateCourseFinalScore.mutate(
      {
        path: { courseId },
        body: finalScore,
      },
      {
        onSuccess: () => {
          updateCourseStatus.mutate(
            {
              path: { courseId },
              body: { status: "Completed" },
            },
            {
              onSuccess: () => {
                toast.success("Đã tổng kết và hoàn thành khóa học.");
                setIsCompletionDialogOpen(false);
              },
              onError: (error) => {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái khóa học.";
                toast.error(message);
              },
            },
          );
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : "Không thể cập nhật điểm tổng kết.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="relative p-4">
          <div className="absolute right-6 top-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenEditCourse}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa thông tin khóa học
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsCompletionDialogOpen(true)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tổng kết khóa học
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleOpenDeleteCourse}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa khóa học
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-left text-foreground">
                  {course?.name || "Khóa học chưa đặt tên"}
                </h1>
                <StatusBadge status={status} />
              </div>
              <InlineEditableInput
                value={course?.goal}
                onSave={handleSaveGoal}
                type="text"
                emptyDisplay="Chưa đặt mục tiêu cho khóa học này."
                displayClassName="text-left text-sm italic text-muted-foreground"
                inputClassName="h-8 text-sm"
              />
              <Progress
                value={progressValue}
                indicatorStyle={
                  { backgroundColor: courseColor } as CSSProperties
                }
              />
            </div>

            <div className="w-full max-w-xl space-y-3 lg:w-110">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatTile
                  label="Mục tiêu"
                  backgroundColor={hexToRgba(courseColor, 0.1)}
                >
                  <InlineEditableInput
                    value={targetScoreValue}
                    onSave={handleSaveTargetScore}
                    type="number"
                    step="0.1"
                    emptyDisplay="--"
                    disabled={updateCourseTargetScore.isPending}
                    displayClassName="text-left text-2xl font-bold text-slate-800"
                    inputClassName="h-8 text-sm"
                  />
                </StatTile>

                <StatTile
                  label="Tiến độ"
                  backgroundColor={hexToRgba(courseColor, 0.1)}
                >
                  <span className="text-2xl font-bold text-slate-800">
                    {totalCompleted} / {estimatedTotal}
                  </span>
                </StatTile>

                {status === "Completed" ? (
                  <StatTile
                    label="Tổng kết"
                    backgroundColor={hexToRgba(courseColor, 0.1)}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: courseColor }}
                    >
                      {finalScoreValue}
                    </span>
                  </StatTile>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-left">
          Sự kiện sắp tới
        </h2>
        {isWorkloadLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <Skeleton key={idx} className="h-16 rounded-md" />
            ))}
          </div>
        ) : upcomingMilestones.length === 0 ? (
          <EmptyState text="Chưa có sự kiện sắp tới." />
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingMilestones.map((milestone, index) => (
              <UpcomingMilestoneRow
                key={`${String(milestone.task.id ?? "milestone")}-${index}`}
                milestone={milestone.task}
                phaseTitle={milestone.phaseTitle}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-left">
          Lịch trình học tập
        </h2>
        {isWorkloadLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <Skeleton key={idx} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : routines.length === 0 ? (
          <EmptyState text="Chưa có lịch trình" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="h-full">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-left text-sm font-semibold text-foreground">
                      {routine.name || "Lịch học"}
                    </p>
                    <Badge variant="secondary">
                      {getRoutineTaskTypeLabel(routine.type)}
                    </Badge>
                  </div>

                  {routine.schedules?.length ? (
                    <div className="space-y-2">
                      {routine.schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Clock size={12} />
                          <span>
                            {weekdayMap[Number(schedule.dayOfWeek)] ||
                              `Thứ ${schedule.dayOfWeek}`}
                          </span>
                          <span>•</span>
                          <span>{schedule.startTime || "--:--"}</span>
                          {schedule.duration ? (
                            <>
                              <span>•</span>
                              <span>{schedule.duration} phút</span>
                            </>
                          ) : null}
                          {schedule.location ? (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={12} />
                                {schedule.location}
                              </span>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có lịch cố định.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isCompletionDialogOpen}
        onOpenChange={setIsCompletionDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tổng kết môn học</DialogTitle>
            <DialogDescription>
              Cập nhật điểm tổng kết và xác nhận hoàn thành khóa học.
            </DialogDescription>
          </DialogHeader>

          <CourseCompletionForm
            courseName={String(course?.name ?? "Khóa học")}
            defaultFinalScore={
              course?.finalScore ? String(course.finalScore) : ""
            }
            isSubmitting={completionPending}
            onCancel={() => setIsCompletionDialogOpen(false)}
            onSubmit={handleCompleteCourse}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <Badge className={COURSE_STATUS_BADGE_CLASS[status]}>
      {COURSE_STATUS_LABELS[status]}
    </Badge>
  );
}

function StatTile({
  label,
  backgroundColor,
  children,
}: {
  label: string;
  backgroundColor: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor }}>
      <p className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <div className="text-left">{children}</div>
    </div>
  );
}

function UpcomingMilestoneRow({
  milestone,
  phaseTitle,
}: {
  milestone: ResponseTaskDto;
  phaseTitle?: string;
}) {
  const dueDate = milestone.endDateTime ?? milestone.startDateTime;
  const { day, month } = formatDayMonth(dueDate);
  const daysLeft = getDaysLeft(dueDate);
  const badgeClass = getCountdownClassName(daysLeft);
  const countdownText = getCountdownText(daysLeft);

  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border bg-muted">
        <span className="text-xs font-semibold leading-none">{day}</span>
        <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
          /{month}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-left">
          {milestone.name || "Milestone"}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {phaseTitle ? (
            <Badge variant="outline" className="max-w-48 truncate">
              {phaseTitle}
            </Badge>
          ) : null}
          <span className={badgeClass}>{countdownText}</span>
        </div>
      </div>
    </div>
  );
}

function parseDateValue(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-8 text-left text-sm text-muted-foreground">
      <div className="mb-2 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 opacity-60" />
        <span>{text}</span>
      </div>
    </div>
  );
}
