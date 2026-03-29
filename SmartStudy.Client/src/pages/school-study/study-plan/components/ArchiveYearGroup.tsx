import type { ResponseStudyPlanDto } from "@/services/api";
import ArchivePlanRow from "./ArchivePlanRow";

interface ArchivePlanMeta {
  courseCount: number;
  progressPercent: number;
}

interface ArchiveYearGroupProps {
  yearLabel: string;
  plans: ResponseStudyPlanDto[];
  termYearByPlanId: Map<number, string>;
  metaByPlanId: Map<number, ArchivePlanMeta>;
  restoringPlanId: number | null;
  onOpenPlan: (plan: ResponseStudyPlanDto) => void;
  onRestorePlan: (plan: ResponseStudyPlanDto) => void;
}

export default function ArchiveYearGroup({
  yearLabel,
  plans,
  termYearByPlanId,
  metaByPlanId,
  restoringPlanId,
  onOpenPlan,
  onRestorePlan,
}: ArchiveYearGroupProps) {
  return (
    <section className="space-y-2">
      <h3 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
        {yearLabel}
      </h3>

      <div className="space-y-1">
        {plans.map((plan) => {
          const planId = Number(plan.id);
          const meta = metaByPlanId.get(planId) ?? {
            courseCount: 0,
            progressPercent: plan.status === "Completed" ? 100 : 0,
          };

          return (
            <ArchivePlanRow
              key={planId}
              plan={plan}
              termYearLabel={
                termYearByPlanId.get(planId) ||
                `HK ${String(plan.termId ?? "-")} - Năm ${String(plan.yearId ?? "-")}`
              }
              courseCount={meta.courseCount}
              progressPercent={meta.progressPercent}
              isRestoring={restoringPlanId === planId}
              onOpen={() => onOpenPlan(plan)}
              onRestore={() => onRestorePlan(plan)}
            />
          );
        })}
      </div>
    </section>
  );
}
