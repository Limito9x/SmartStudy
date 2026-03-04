import WeekCalendar from "@/components/features/calendar/WeekCalendar";
import ScheduleCourseList from "@/components/features/calendar/side-list/ScheduleCourseList";
import { useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/SchoolStudyLayout";

export default function SemesterSchedulePage() {
  const { currentSemester } = useOutletContext<SemesterOutletContext>();

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-hidden">
      {currentSemester && (
        <h1 className="text-xl font-bold shrink-0">{`Lịch trình học kỳ ${currentSemester.term} ${currentSemester.year}`}</h1>
      )}
      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden">
        <div className="w-44 shrink-0 h-full overflow-y-auto">
          <ScheduleCourseList semesterId={currentSemester?.id} />
        </div>
        <div className="flex-1 min-w-0 h-full">
          <WeekCalendar />
        </div>
      </div>
    </div>
  );
}
