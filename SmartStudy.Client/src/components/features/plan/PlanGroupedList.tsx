import {
  type RequestStudyPlanDto,
} from "@/services/api";
import PlanListItem from "./PlanListItem";

interface PlanGroupedListProps {
  plans: RequestStudyPlanDto[];
  onSelectPlan?: (plan: RequestStudyPlanDto) => void;
}

export default function PlanGroupedList({
  plans,
  onSelectPlan,
}: PlanGroupedListProps) {
  // 1. Sắp xếp mảng theo ngày bắt đầu để đảm bảo thứ tự thời gian chuẩn
  const sortedPlans = [...plans].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  // 2. Gom nhóm theo Năm (Year)
  const groupedData = sortedPlans.reduce(
    (acc, current) => {
      const yearStr = current.academicYearId.toString();
      if (!acc[yearStr]) acc[yearStr] = [];
      acc[yearStr].push(current);
      return acc;
    },
    {} as Record<string, RequestStudyPlanDto[]>,
  );

  // Biến đếm toàn cục để đánh số 1, 2, 3, 4 xuyên suốt các năm
  let globalCounter = 1;

  return (
    <div className="w-full max-w-3xl rounded-xl border border-[#E5E2D9] bg-[#F2EFE9] p-6 shadow-sm max-h-96 overflow-y-auto">
      {Object.entries(groupedData).map(([year, semsInYear], groupIndex) => (
        <div key={year} className="mb-6 last:mb-0">
          {/* Tiêu đề Gom nhóm: NĂM 1, NĂM 2... */}
          <div className="mb-3 flex items-center gap-4">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Năm {year}
            </span>
            <div className="h-[1px] flex-1 bg-gray-300"></div>
          </div>

          {/* Danh sách các kỳ trong năm đó */}
          <div className="flex flex-col gap-1">
            {semsInYear.map((plan, index) => {
              const currentIndex = globalCounter++; // Lấy số hiện tại rồi cộng lên 1 cho vòng lặp sau
              return (
                <PlanListItem
                  key={index}
                  plan={plan}
                  globalIndex={currentIndex}
                  onClick={() => onSelectPlan?.(plan)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
