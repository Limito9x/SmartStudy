import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCompletionForm from "@/components/features/course-tabs/CourseCompletionForm";
import { useCourse } from "@/hooks/entities/useCourse";
import { useDialogStore } from "@/stores/useDialogStore";
import type {
  CourseStatus,
  ResponseCourseDto,
  ResponseTimelineEventDto,
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
  getEventTypeLabel,
  getRoutineTaskTypeLabel,
  hexToRgba,
  normalizeHexColor,
  sortTimelineEventsByPriority,
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
  routines: SimpleResponseRoutineDto[];
  isRoutinesLoading: boolean;
}

export default function OverviewTab({
  course,
  courseId,
  studyPlanId,
  studyPlanType,
  routines,
  isRoutinesLoading,
}: OverviewTabProps) {
  const { openDialog } = useDialogStore();
  const {
    updateCourseStatus,
    updateCourseTargetScore,
    updateCourseFinalScore,
    deleteCourse,
  } = useCourse({ studyPlanId });

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
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

  useEffect(() => {
    setTargetDraft(targetScoreValue);
  }, [targetScoreValue]);

  const upcomingEvents = useMemo(() => {
    return sortTimelineEventsByPriority(course?.timelineEvents ?? []);
  }, [course?.timelineEvents]);

  const handleSaveTargetScore = () => {
    const trimmed = targetDraft.trim();
    const numeric = Number(trimmed);

    if (!trimmed || Number.isNaN(numeric)) {
      toast.error("Vui lòng nhập điểm mục tiêu hợp lệ.");
      return;
    }

    if (trimmed === targetScoreValue) {
      setIsEditingTarget(false);
      return;
    }

    updateCourseTargetScore.mutate(
      {
        path: { courseId },
        body: numeric,
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật mục tiêu điểm.");
          setIsEditingTarget(false);
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : "Không thể cập nhật mục tiêu.";
          toast.error(message);
        },
      },
    );
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
              <p className="text-left text-sm italic text-muted-foreground">
                {course?.goal || "Chưa đặt mục tiêu cho khóa học này."}
              </p>
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
                  <InlineTargetScore
                    isEditing={isEditingTarget}
                    value={targetDraft}
                    displayValue={targetScoreValue}
                    isPending={updateCourseTargetScore.isPending}
                    onStartEdit={() => setIsEditingTarget(true)}
                    onChange={setTargetDraft}
                    onSave={handleSaveTargetScore}
                    onCancel={() => {
                      setTargetDraft(targetScoreValue);
                      setIsEditingTarget(false);
                    }}
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
        {upcomingEvents.length === 0 ? (
          <EmptyState text="Chưa có sự kiện sắp tới." />
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event, index) => (
              <UpcomingEventRow
                key={`${String(event.id ?? "event")}-${index}`}
                event={event}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-left">
          Lịch trình học tập
        </h2>
        {isRoutinesLoading ? (
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

function InlineTargetScore({
  isEditing,
  value,
  displayValue,
  isPending,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  value: string;
  displayValue: string;
  isPending: boolean;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onStartEdit}
        className="text-left text-2xl font-bold text-slate-800"
      >
        {displayValue}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={value}
      disabled={isPending}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCancel}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSave();
        }

        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      }}
      className="h-8 text-sm"
    />
  );
}

function UpcomingEventRow({ event }: { event: ResponseTimelineEventDto }) {
  const { day, month } = formatDayMonth(event.dueDate);
  const daysLeft = getDaysLeft(event.dueDate);
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
          {event.title || "Sự kiện"}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="secondary">{getEventTypeLabel(event.type)}</Badge>
          <span className={badgeClass}>{countdownText}</span>
        </div>
      </div>
    </div>
  );
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
