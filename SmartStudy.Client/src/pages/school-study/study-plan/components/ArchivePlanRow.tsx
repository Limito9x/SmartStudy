import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ResponseStudyPlanDto } from "@/services/api";
import { ArchiveRestore, CalendarDays, ChevronRight } from "lucide-react";

interface ArchivePlanRowProps {
  plan: ResponseStudyPlanDto;
  termYearLabel: string;
  courseCount: number;
  progressPercent: number;
  onOpen: () => void;
  onRestore: () => void;
  isRestoring: boolean;
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
  termYearLabel,
  courseCount,
  progressPercent,
  onOpen,
  onRestore,
  isRestoring,
}: ArchivePlanRowProps) {
  const type = String(plan.type || "Personal");
  const status = String(plan.status || "Completed");

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-3 transition-colors hover:bg-slate-50"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
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
                  PLAN_TYPE_BADGE_CLASS[type] || PLAN_TYPE_BADGE_CLASS.Personal
                }
              >
                {PLAN_TYPE_LABEL[type] || PLAN_TYPE_LABEL.Personal}
              </Badge>
              <Badge variant="outline">{termYearLabel}</Badge>
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

        <div className="hidden min-w-32 items-center gap-2 sm:flex">
          <Progress value={progressPercent} className="h-1.5 bg-slate-200" />
          <span className="w-10 text-right text-xs font-semibold text-slate-700">
            {progressPercent}%
          </span>
        </div>

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

        <ChevronRight className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}
