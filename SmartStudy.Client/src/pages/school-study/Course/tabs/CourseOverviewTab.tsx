// CourseOverviewTab.tsx
import { type ResponseCourseDto } from "@/services/api";
import { Target, Clock, MapPin } from "lucide-react";
import { useRoutine } from "@/hooks/entities/useRoutine";
import { weekdayMap } from "@/utils/calendar";

export default function CourseOverviewTab({
  course,
}: {
  course: ResponseCourseDto | null | undefined;
}) {
  const { getAllRoutines } = useRoutine();
  const { data: routines } = getAllRoutines({
    studyPlanId: Number(course?.studyPlanId),
    type: "ClassSession",
    courseId: Number(course?.id),
  });

  const classRoutine = routines?.[0]; // ClassSession routine của môn này

  return (
    <div className="space-y-5">
      {/* Score cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              Mục tiêu
            </p>
          </div>
          <p className="text-3xl font-bold">{course?.targetScore ?? "—"}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Hiện tại
            </p>
          </div>
          <p className="text-3xl font-bold text-muted-foreground">
            {course?.finalScore ?? "—"}
          </p>
        </div>
      </div>

      {/* Lịch học */}
      {classRoutine && classRoutine.schedules?.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-primary" />
            <h4 className="font-medium text-sm">Lịch học</h4>
          </div>
          <div className="space-y-3">
            {classRoutine.schedules.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="font-medium w-16 shrink-0">
                  {weekdayMap[s.dayOfWeek]}
                </span>
                <span className="text-muted-foreground">{s.startTime}</span>
                {s.location && (
                  <span className="flex items-center gap-1 text-muted-foreground ml-auto">
                    <MapPin size={12} />
                    {s.location}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
