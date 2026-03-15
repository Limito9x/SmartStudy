import RoutineSidebar from "@/components/features/routine/RoutineSidebar";
import { useState, useRef, useEffect } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewWeek } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import "temporal-polyfill/global";
import { toScheduleXEvent, toDateString } from "@/utils/temporal";
import type { SimpleResponseRoutineDto } from "@/services/api";
import ScheduleForm from "@/components/forms/schedule/ScheduleForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { useCalendar } from "@/hooks/entities/useCalendar";
import { useSchedule } from "@/hooks/entities/useSchedule";
import { weekdayMap } from "@/utils/calendar";
import { type StudyPlanOutletContext } from "@/layouts/StudyPlanLayout";
import { useOutletContext } from "react-router-dom";

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=CN, 1=T2...
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return { from: fmt(monday), to: fmt(sunday) };
}

    const toCSharpDayOfWeek = (temporalDow: number) =>
      temporalDow === 7 ? 0 : temporalDow;

export default function PlanSchedulingTab() {
  const [selectedRoutine, setSelectedRoutine] =
    useState<SimpleResponseRoutineDto | null>(null);
  const selectedRoutineRef = useRef<SimpleResponseRoutineDto | null>(null);
  const { openDialog, closeDialog } = useDialogStore();
  const { selectedStudyPlan } = useOutletContext<StudyPlanOutletContext>();

  const [currentRange, setCurrentRange] = useState(getCurrentWeekRange());
  // Api hooks
  const { data: calendarData } = useCalendar({
    from: currentRange.from,
    to: currentRange.to,
    studyPlanId: Number(selectedStudyPlan?.id),
  });

  const calendar = useCalendarApp({
    locale: "vi-VN",
    timezone: "Asia/Ho_Chi_Minh",
    views: [createViewWeek()],
    plugins: [],
    dayBoundaries: { start: "07:00", end: "22:00" },
    minDate: Temporal.Now.plainDateISO("Asia/Ho_Chi_Minh"),
    callbacks: {
      onClickDateTime(dateTime) {
        const today = Temporal.Now.plainDateISO("Asia/Ho_Chi_Minh");
        if (Temporal.PlainDate.compare(dateTime.toPlainDate(), today) < 0) {
          return;
        }

        if (!selectedRoutineRef.current) {
          alert("Vui lòng chọn lịch cần sắp xếp trước!");
          return;
        }
        handleAddSchedule(dateTime);
      },
      onRangeUpdate(range) {
        setCurrentRange({
          from: toDateString(range.start),
          to: toDateString(range.end),
        });
      },
    },
  });

  useEffect(() => {
    if (!calendarData || !calendar) return;

    const events = calendarData.map((task) =>
      toScheduleXEvent({
        id: String(task.id),
        title: task.title ?? "",
        startDate: task.startDate,
        startTime: task.startTime,
        endTime: task.endTime,
        location: task.location ?? undefined,
      }),
    );

    calendar.events.set(events);
  }, [calendarData, calendar]); // thêm calendar vào đây

  const { createSchedule } = useSchedule();

  const handleAddSchedule = (dateTime: Temporal.ZonedDateTime) => {
    const hour = dateTime.hour;
    const minute = dateTime.minute;
    const weekday = toCSharpDayOfWeek(dateTime.dayOfWeek);
    openDialog({
      title: "Thêm lịch mới",
      description: `${selectedRoutineRef.current?.name} - ${weekdayMap[weekday]}`,
      view: (
        <ScheduleForm
          defaultValues={{
            startTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
            duration: 90,
            location: "",
            dayOfWeek: weekday,
          }}
          onSubmit={(values) => {
            console.log("Creating schedule with values", values);
            createSchedule.mutate({
              body: {
                routineId: Number(selectedRoutineRef.current?.id),
                ...values,
                location: values.location || null,
              },
            });
            closeDialog();
          }}
        />
      ),
    });
  };

  // Sync ref
  useEffect(() => {
    selectedRoutineRef.current = selectedRoutine;
  }, [selectedRoutine]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col border-r bg-muted/20 overflow-hidden">
        <RoutineSidebar
          selectedRoutineId={Number(selectedRoutine?.id)}
          onSelectRoutine={(routine) => {
            console.log("Selected routine", routine);
            setSelectedRoutine(routine);
          }}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden p-3">
        <div className="flex-1 min-h-0 [&>.sx-react-calendar-wrapper]:h-full">
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      </div>
    </div>
  );
}
