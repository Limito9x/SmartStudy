import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getCourseWorkloadOptions } from "@/services/api/@tanstack/react-query.gen";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  CourseOccurenceDto,
  CoursePhaseWorkloadDto,
  CourseRoutineDto,
} from "@/services/api";
import CourseTaskCard from "@/components/features/course-workloads/components/CourseTaskCard";
import { useDialogStore } from "@/stores/useDialogStore";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { usePanelStore } from "@/stores/usePanelStore";
import { getTaskTypeLabel } from "@/components/features/task/FormatTask";
import ActionMenu from "@/components/shared/ActionMenu";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";

const PHASE_TYPE_LABELS: Record<string, string> = {
  General: "Mặc định",
  ExamPrep: "Ôn thi",
  Project: "Đồ án / Dự án",
  Assignment: "Bài tập lớn",
  Custom: "Tuỳ chỉnh",
};

interface WorkloadsTabProps {
  courseId: number;
}

export default function WorkloadsTab({ courseId }: WorkloadsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedPhases, setCollapsedPhases] = useState<
    Record<number, boolean>
  >({});
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { openDialog } = useDialogStore();

  const workloadQuery = useQuery({
    ...getCourseWorkloadOptions({
      path: { courseId },
      query: {
        search: debouncedSearch || undefined,
      },
    }),
    enabled: !!courseId,
  });

  const phases = useMemo(
    () => workloadQuery.data?.phases ?? [],
    [workloadQuery.data?.phases],
  );

  const isEmpty = phases.length === 0;

  const togglePhase = (phaseId: number) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full space-y-3 md:w-auto flex-1">
          <div className="flex items-center gap-3 w-full">
            <h2 className="text-lg font-semibold">Danh sách Công việc</h2>
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
              <Badge variant="outline">{phases.length} giai đoạn</Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Input
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-85"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDialog("PHASE_FORM", { courseId })}
            >
              <Plus size={14} /> Thêm giai đoạn
            </Button>
          </div>
        </div>
      </div>

      {workloadQuery.isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : workloadQuery.error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Không thể tải workload khóa học.
        </div>
      ) : isEmpty ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <AlertCircle className="mb-4 h-14 w-14 text-muted-foreground/60" />
          <p className="text-base font-semibold">
            Chưa có phase nào cho môn học
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo phase trước khi thêm công việc/routine.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {phases.map((phase) => (
            <PhaseSection
              key={String(phase.id)}
              phase={phase}
              courseId={courseId}
              isCollapsed={collapsedPhases[toNumber(phase.id)] ?? false}
              onToggle={() => togglePhase(toNumber(phase.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function PhaseSection({
  phase,
  courseId,
  isCollapsed,
  onToggle,
}: {
  phase: CoursePhaseWorkloadDto;
  courseId: number;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const { openDialog } = useDialogStore();
  const phaseId = toNumber(phase.id);
  const routines = phase.routines ?? [];
  const singleTasks = phase.tasks ?? [];
  const phaseTypeString = phase.phaseType ?? "General";
  const phaseTypeLabel = PHASE_TYPE_LABELS[phaseTypeString] || phaseTypeString;
  const { deleteEvent } = useTimelineEvent({ courseId });

  const phaseActions = [
    {
      label: "Chỉnh sửa",
      onClick: () => openDialog("PHASE_FORM", { courseId, phaseId }),
    },
  ];

  // Không cho xoá các Phase mặc định (General)
  if (phaseTypeString !== "General") {
    phaseActions.push({
      label: "Xoá",
      onClick: () => {
        openDialog("CONFIRM_DELETE", {
          itemType: "giai đoạn",
          itemName: phase.title ?? "Phase",
          onConfirm: () => {
            deleteEvent.mutate({ path: { phaseId: phaseId } });
          },
        });
      },
    });
  }

  return (
    <section className="rounded-2xl border bg-card overflow-hidden">
      {/* ── Full-width Phase header ── */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="group inline-flex items-center gap-2 text-left"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            )}
            <p className="text-base font-semibold">{phase.title ?? "Phase"}</p>
          </button>
          <span className="text-xs text-muted-foreground">·</span>
          {phaseTypeString !== "General" && (
            <span className="text-xs text-muted-foreground">
              {phaseTypeLabel}
            </span>
          )}
          {phaseTypeString === "General" && (
            <span className="text-xs text-muted-foreground">
              {phaseTypeLabel}
            </span>
          )}
          <Badge variant="outline" className="ml-1 text-[11px]">
            {routines.length} routine
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            {singleTasks.length} task
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDialog("ROUTINE_FORM", { courseId, phaseId })}
          >
            <Plus size={14} />
            Thêm routine
          </Button>
          <Button
            size="sm"
            onClick={() => openDialog("TASK_FORM", { courseId, phaseId })}
          >
            <Plus size={14} />
            Thêm task
          </Button>
          <ActionMenu actions={phaseActions} />
        </div>
      </div>

      {/* ── Body ── */}
      {!isCollapsed && (
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <SectionLabel title="Routine" />
            {routines.length === 0 ? (
              <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                Chưa có routine
              </div>
            ) : (
              <div className="space-y-3">
                {routines.map((routine) => (
                  <RoutineOccurrenceCard
                    key={String(routine.routine?.id ?? Math.random())}
                    routine={routine}
                    courseId={courseId}
                    phaseId={phaseId}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <SectionLabel title="Task lẻ" />
            {singleTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                Chưa có task lẻ
              </div>
            ) : (
              <div className="space-y-2">
                {singleTasks.map((task) => (
                  <CourseTaskCard key={String(task.id)} taskData={task} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function RoutineOccurrenceCard({
  routine,
  courseId,
  phaseId,
}: {
  routine: CourseRoutineDto;
  courseId: number;
  phaseId: number;
}) {
  const { openDialog } = useDialogStore();
  const { openPanel, type: panelType, data: panelData } = usePanelStore();
  const routineData = routine.routine;
  const occurrences = routine.occurences ?? [];

  const openRoutineEdit = () => {
    if (!routineData?.id) {
      return;
    }

    openDialog("ROUTINE_FORM", {
      routineId: toNumber(routineData.id),
      courseId,
      phaseId,
    });
  };

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            {routineData?.name ?? "Routine"}
          </p>
          <p className="text-xs text-muted-foreground">
            {getTaskTypeLabel(routineData?.type)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{occurrences.length} buổi</Badge>
          <Button variant="ghost" size="sm" onClick={openRoutineEdit}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {occurrences.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          Routine chưa có occurrence.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {occurrences.map((occurrence) => {
            const status = getOccurrenceStatus(occurrence);
            const taskId = toNumber(occurrence.taskId);
            const label = formatOccurrenceLabel(occurrence.date);
            const isActive =
              panelType === "TASK_DETAIL" &&
              panelData != null &&
              "taskId" in panelData &&
              (panelData as { taskId: number }).taskId === taskId &&
              taskId > 0;

            return (
              <button
                key={`${routineData?.id ?? "r"}-${occurrence.number}-${occurrence.date}`}
                type="button"
                title={buildOccurrenceTitle(occurrence, status)}
                onClick={() => {
                  if (taskId > 0) {
                    openPanel("TASK_DETAIL", { taskId });
                  }
                }}
                disabled={taskId <= 0}
                className={cn(
                  "flex flex-col items-center gap-0.5",
                  "focus-visible:outline-none",
                  taskId <= 0 && "cursor-default",
                )}
              >
                {/* Label: Thứ - Ngày/Tháng */}
                <span className="text-[10px] text-gray-500 leading-none">
                  {label}
                </span>
                {/* Ô số */}
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition",
                    status.containerClass,
                    isActive && "ring-2 ring-offset-1 ring-primary scale-110",
                  )}
                >
                  {toNumber(occurrence.number)}
                  {status.icon === "check" && (
                    <Check className="absolute right-0.5 top-0.5 h-3 w-3" />
                  )}
                  {status.icon === "late" && (
                    <AlertTriangle className="absolute right-0.5 top-0.5 h-3 w-3" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getOccurrenceStatus(occurrence: CourseOccurenceDto) {
  const normalized = (occurrence.status ?? "").toLowerCase();
  const taskId = toNumber(occurrence.taskId);
  const isCompleted = occurrence.isCompleted || normalized === "completed";
  const isInProgress = normalized === "inprogress";
  const date = occurrence.date ? new Date(occurrence.date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isValidDate = !!date && !Number.isNaN(date.getTime());
  const isLate =
    !isCompleted &&
    isValidDate &&
    date.getTime() < today.getTime() &&
    taskId > 0;

  if (isLate) {
    return {
      containerClass: "border-rose-300 bg-rose-50 text-rose-700",
      icon: "late" as const,
      label: "Trễ hạn",
    };
  }

  if (taskId <= 0) {
    return {
      containerClass: "border-slate-300 bg-slate-100 text-slate-600",
      icon: null,
      label: "Chưa lên lịch",
    };
  }

  if (isCompleted) {
    return {
      containerClass: "border-emerald-300 bg-emerald-50 text-emerald-700",
      icon: "check" as const,
      label: "Hoàn thành",
    };
  }

  if (isInProgress) {
    return {
      containerClass: "border-orange-300 bg-orange-50 text-orange-700",
      icon: null,
      label: "Đang làm",
    };
  }

  return {
    containerClass: "border-sky-300 bg-sky-50 text-sky-700",
    icon: null,
    label: "Pending",
  };
}

function buildOccurrenceTitle(
  occurrence: CourseOccurenceDto,
  status: { label: string },
) {
  const date = occurrence.date ? formatDate(occurrence.date) : "Chưa rõ ngày";
  const taskName = occurrence.taskName ?? "Chưa có task";
  return `Buổi ${toNumber(occurrence.number)} - ${taskName} - ${date} - ${status.label}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toNumber(value?: number | string | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

// Format "T3 - 20/04" từ ISO date string
const DAY_ABBR = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatOccurrenceLabel(value?: string | null): string {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  const day = DAY_ABBR[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${day} ${dd}/${mm}`;
}
