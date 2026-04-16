import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/data-table/DataTable";
import type {
  ResponseStudyPlanDto,
  SimpleResponseCourseDto,
} from "@/services/api";
import {
  ArchiveRestore,
  CalendarDays,
  ChevronDown,
  Eye,
  Upload,
} from "lucide-react";
import { useMemo } from "react";
import { getCourseColumns, type CourseTableMeta } from "./courseColumn";

interface ArchivePlanRowProps {
  plan: ResponseStudyPlanDto;
  courses: SimpleResponseCourseDto[];
  termYearLabel: string;
  courseCount: number;
  isExpanded: boolean;
  savingCourseId: number | null;
  onToggleExpand: () => void;
  onUpdateCourseFinalScore: (courseId: number, score: number) => Promise<void>;
  onRestore: () => void;
  isRestoring: boolean;
  onPreviewTemplate: () => void;
  onPublishTemplate: () => void;
  isPreviewingTemplate: boolean;
  isPublishingTemplate: boolean;
}

const PLAN_TYPE_BADGE_CLASS: Record<string, string> = {
  Academic: "bg-blue-100 text-blue-900",
  Personal: "bg-amber-100 text-amber-900",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-900",
  Archived: "bg-slate-100 text-slate-700",
};

const PLAN_TYPE_LABEL: Record<string, string> = {
  Academic: "Đại học",
  Personal: "Cá nhân",
};

const STATUS_LABEL: Record<string, string> = {
  Completed: "Hoàn thành",
  Archived: "Đã lưu trữ",
};

export default function ArchivePlanRow({
  plan,
  courses,
  termYearLabel,
  courseCount,
  isExpanded,
  savingCourseId,
  onToggleExpand,
  onUpdateCourseFinalScore,
  onRestore,
  isRestoring,
  onPreviewTemplate,
  onPublishTemplate,
  isPreviewingTemplate,
  isPublishingTemplate,
}: ArchivePlanRowProps) {
  const type = String(plan.type || "Personal");
  const status = String(plan.status || "Completed");

  const tableMeta: CourseTableMeta = useMemo(
    () => ({
      savingCourseId,
      onSaveFinalScore: onUpdateCourseFinalScore,
    }),
    [onUpdateCourseFinalScore, savingCourseId],
  );

  const isAcademicPlan = type === "Academic";
  const courseColumns = useMemo(
    () => getCourseColumns({ isAcademicPlan }),
    [isAcademicPlan],
  );
  const totalCredits = useMemo(
    () => Number(plan.totalCredits ?? 0),
    [plan.totalCredits],
  );
  const gpa = useMemo(() => Number(plan.gpa ?? 0), [plan.gpa]);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div
        role="button"
        tabIndex={0}
        className="flex cursor-pointer items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-slate-50"
        onClick={onToggleExpand}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggleExpand();
          }
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">
                {plan.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    PLAN_TYPE_BADGE_CLASS[type] ||
                    PLAN_TYPE_BADGE_CLASS.Personal
                  }
                >
                  {PLAN_TYPE_LABEL[type] || PLAN_TYPE_LABEL.Personal}
                </Badge>
                {type === "Academic" && (
                  <Badge variant="outline">{termYearLabel}</Badge>
                )}
                <Badge
                  className={
                    STATUS_BADGE_CLASS[status] || STATUS_BADGE_CLASS.Completed
                  }
                >
                  {STATUS_LABEL[status] || STATUS_LABEL.Completed}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden w-28 sm:block">
            <p className="text-right text-sm font-semibold text-slate-900">
              {courseCount} môn
            </p>
            <p className="text-right text-xs text-slate-500">khóa học</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isPreviewingTemplate || isPublishingTemplate}
            onClick={(event) => {
              event.stopPropagation();
              onPreviewTemplate();
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isPreviewingTemplate ? "Đang mở..." : "Xem preview"}
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={isPublishingTemplate || isPreviewingTemplate}
            onClick={(event) => {
              event.stopPropagation();
              onPublishTemplate();
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isPublishingTemplate ? "Đang public..." : "Public"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isRestoring}
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
          >
            <ArchiveRestore className="mr-2 h-4 w-4" />
            {isRestoring ? "Đang khôi phục" : "Khôi phục"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand();
            }}
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <div className="border-t bg-slate-50/70 p-3">
          {isAcademicPlan ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">Tổng tín chỉ: {totalCredits}</Badge>
              <Badge variant="outline">GPA: {gpa.toFixed(2)}</Badge>
            </div>
          ) : null}

          {courses.length > 0 ? (
            <DataTable
              data={courses}
              columns={courseColumns}
              meta={tableMeta}
            />
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Kế hoạch này chưa có môn học.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
