import type { ResponseStudyPlanDto } from "@/services/api";
import ArchivePlanRow from "./ArchivePlanRow";

interface ArchivePlanMeta {
  courseCount: number;
}

interface ArchiveYearGroupProps {
  yearLabel: string;
  plans: ResponseStudyPlanDto[];
  termYearByPlanId: Map<number, string>;
  restoringPlanId: number | null;
  expandedPlanId: number | null;
  savingCourseId: number | null;
  onToggleExpand: (planId: number) => void;
  onUpdateCourseFinalScore: (
    planId: number,
    courseId: number,
    score: number,
  ) => Promise<void>;
  onRestorePlan: (plan: ResponseStudyPlanDto) => void;
}

export default function ArchiveYearGroup({
  yearLabel: _yearLabel,
  plans,
  termYearByPlanId,
  restoringPlanId,
  expandedPlanId,
  savingCourseId,
  onToggleExpand,
  onUpdateCourseFinalScore,
  onRestorePlan,
}: ArchiveYearGroupProps) {
  return (
    <section className="space-y-2">
      <div className="space-y-1">
        {plans.map((plan) => {
          const planId = Number(plan.id);
          const courses = plan.courses || [];
          const meta: ArchivePlanMeta = {
            courseCount: courses.length,
          };

          return (
            <ArchivePlanRow
              key={planId}
              plan={plan}
              courses={courses}
              termYearLabel={
                termYearByPlanId.get(planId) ||
                `HK ${String(plan.termId ?? "-")} - Năm ${String(plan.yearId ?? "-")}`
              }
              courseCount={meta.courseCount}
              isExpanded={expandedPlanId === planId}
              savingCourseId={savingCourseId}
              isRestoring={restoringPlanId === planId}
              onToggleExpand={() => onToggleExpand(planId)}
              onUpdateCourseFinalScore={(courseId, score) =>
                onUpdateCourseFinalScore(planId, courseId, score)
              }
              onRestore={() => onRestorePlan(plan)}
            />
          );
        })}
      </div>
    </section>
  );
}
