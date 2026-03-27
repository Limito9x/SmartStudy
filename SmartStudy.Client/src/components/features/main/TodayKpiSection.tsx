import { CalendarDays, CheckCircle2, CircleGauge, Clock3 } from "lucide-react";
import type { DashboardSummaryDto } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import TodayKpiCard from "@/components/features/main/TodayKpiCard";
import {
  asNumber,
  formatDecimal,
  formatPercent,
} from "@/components/features/main/today-formatters";

interface TodayKpiSectionProps {
  summary: DashboardSummaryDto | null | undefined;
  isLoading: boolean;
}

const MOBILE_CARD_WIDTH = "min-w-[260px] max-w-[280px]";

export default function TodayKpiSection({
  summary,
  isLoading,
}: TodayKpiSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: "study-hours",
      title: "Giờ học tuần này",
      value: `${formatDecimal(summary?.weeklyStudyHours)}h`,
      icon: Clock3,
      iconClassName: "text-sky-600",
      deltaValue: summary?.hoursDelta,
      deltaUnit: "h",
    },
    {
      key: "productivity",
      title: "Năng suất tuần này",
      value: `${formatDecimal(summary?.weeklyProductivity, 0)}%`,
      icon: CircleGauge,
      iconClassName: "text-emerald-600",
      deltaValue: summary?.productivityDelta,
      deltaUnit: "%",
    },
    {
      key: "completion-rate",
      title: "Tỷ lệ hoàn thành tuần",
      value: formatPercent(summary?.weeklyCompletionRate),
      icon: CheckCircle2,
      iconClassName: "text-amber-600",
      description: "Dựa trên nhiệm vụ đã hoàn tất",
    },
    {
      key: "current-plan",
      title: "Kế hoạch hiện tại",
      value: `${Math.max(asNumber(summary?.daysLeftInPlan), 0)} ngày`,
      icon: CalendarDays,
      iconClassName: "text-violet-600",
      description: summary?.currentPlanName ?? "Chưa có kế hoạch",
    },
  ] as const;

  return (
    <>
      <div className="-mx-4 px-4 md:hidden">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
          {cards.map(({ key, ...card }) => (
            <div key={key} className={MOBILE_CARD_WIDTH}>
              <TodayKpiCard {...card} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, ...card }) => (
          <TodayKpiCard key={key} {...card} />
        ))}
      </div>
    </>
  );
}
