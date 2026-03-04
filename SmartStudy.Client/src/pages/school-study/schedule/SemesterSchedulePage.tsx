import WeekCalendar, {
  type WeekDayDef,
} from "@/components/features/calendar/WeekCalendar";
import ScheduleCourseList from "@/components/features/calendar/side-list/ScheduleCourseList";
import { useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/SchoolStudyLayout";
import type { SimpleResponseCourseDto } from "@/services/api";
import { getSchedulesBySemester, registerSchedule } from "@/services/api";
import { ScheduleForm } from "@/components/forms/schedule";
import { useDialogStore } from "@/stores/useDialogStore";
import { mapCourseSchedulesToCalendarEvents } from "@/utils/calendarMapper";
import { useQuery } from "@tanstack/react-query";
import { useBaseMutation } from "@/hooks/use-mutation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SemesterSchedulePage() {
  const { currentSemester } = useOutletContext<SemesterOutletContext>();
  if (!currentSemester) return <div>Không tìm thấy học kỳ</div>;
  // State:
  // Course được chọn để đăng ký lịch
  const [selectedCourse, setSelectedCourse] =
    useState<SimpleResponseCourseDto | null>(null);
  // Mode
  const [mode, setMode] = useState<"view" | "edit">("view");

  const handleSelectCourse = (course: SimpleResponseCourseDto) => {
    if (mode === "view") return;
    setSelectedCourse(course);
  };

  const stopEditing = () => {
    setMode("view");
    setSelectedCourse(null);
  };

  const { data: schedules } = useQuery({
    queryKey: ["schedules", currentSemester?.id],
    queryFn: async () => {
      if (!currentSemester) return [];
      const response = await getSchedulesBySemester({
        path: { semesterId: currentSemester.id },
      });
      return response.data;
    },
    enabled: !!currentSemester,
  });

  const addScheduleMutation = useBaseMutation(
    async (newSchedule: any) => {
      const response = await registerSchedule({
        body: newSchedule,
      });
      return response.data;
    },
    {
      queryKey: ["schedules", currentSemester?.id],
      successMessage: "Đăng ký lịch thành công!",
      errorMessage: "Có lỗi xảy ra khi đăng ký lịch!",
    },
  );

  const { openDialog, closeDialog } = useDialogStore();

  const handleRegisterSchedule = (dayOfWeek: WeekDayDef, hour: number) => {
    if (!selectedCourse) return;
    const baseFormValues = {
      ownerType: "Course" as const,
      ownerId: String(selectedCourse.id),
      dayOfWeek: dayOfWeek.value,
      startTime: `${String(hour).padStart(2, "0")}:00`,
    };
    openDialog({
      title: `Đăng ký lịch cho ${selectedCourse.name}`,
      view: (
        <>
          <strong>
            {dayOfWeek.name} - {hour}:00
          </strong>
          <ScheduleForm
            onSubmit={(data) => {
              const payload = {
                ...data,
                ...baseFormValues,
              };
              console.log("Submitting schedule with payload:", payload);
              addScheduleMutation.mutate(payload);
              closeDialog();
            }}
            defaultValues={{
              ...baseFormValues,
            }}
          />
        </>
      ),
    });
  };

  const calendarEvents = schedules
    ? mapCourseSchedulesToCalendarEvents({
        schedules,
      })
    : [];

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-hidden">
      {currentSemester && (
        <h1 className="text-xl font-bold shrink-0">{`Lịch trình học kỳ ${currentSemester.term} ${currentSemester.year}`}</h1>
      )}
      <Button
        onClick={() => {
          if (mode === "view") {
            setMode("edit");
          } else {
            stopEditing();
          }
        }}
        className={`${mode === "edit" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} shrink-0`}
      >
        {mode === "view" ? "Chỉnh sửa lịch" : "Xem lịch"}
      </Button>
      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden">
        <div className="w-44 shrink-0 h-full overflow-y-auto">
          <ScheduleCourseList
            selectedCourseId={selectedCourse?.id}
            semesterId={currentSemester?.id}
            onSelectCourse={handleSelectCourse}
          />
        </div>
        <div className={`flex-1 min-w-0 h-full ${mode === "edit" ? "bg-blue-50 border-2 border-blue-200 rounded-lg" : ""}`}>
          <WeekCalendar
            events={calendarEvents}
            onCellClick={mode === "edit" ? handleRegisterSchedule : undefined}
          />
        </div>
      </div>
    </div>
  );
}
