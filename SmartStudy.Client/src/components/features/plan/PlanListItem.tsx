import { format, differenceInWeeks } from "date-fns";
import { type RequestStudyPlanDto } from "@/services/api";

interface PlanListItemProps {
  plan: RequestStudyPlanDto;
  globalIndex: number; // Số thứ tự liên tục (1, 2, 3...)
  onClick?: () => void;
}

export default function PlanListItem({
  plan,
  globalIndex,
  onClick,
}: PlanListItemProps) {
  // Tính số tuần giữa 2 khoảng thời gian
  const weeks = differenceInWeeks(
    new Date(plan.endDate),
    new Date(plan.startDate),
  );

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-black/5"
    >
      <div className="flex items-center gap-4">
        {/* Khối ô vuông chứa số thứ tự bên trái */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-colors group-hover:border-primary group-hover:text-primary">
          {globalIndex}
        </div>

        {/* Cột thông tin ở giữa */}
        <div className="flex flex-col">
          <span className="text-base font-medium text-gray-900">
            Học kỳ {plan.academicTermId} — Năm {plan.academicYearId}
          </span>
          <span className="text-sm text-gray-400">
            {format(new Date(plan.startDate), "dd/MM/yyyy")} &rarr;{" "}
            {format(new Date(plan.endDate), "dd/MM/yyyy")}
          </span>
        </div>
      </div>

      {/* Badge hiển thị số tuần bên phải */}
      <div className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-400 shadow-sm">
        {weeks}w
      </div>
    </div>
  );
}
