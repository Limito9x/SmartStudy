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

interface SchedulingTabProps {
  studyPlanId: number;
}

const weekdayMap: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "Chủ nhật",
};

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=CN, 1=T2...
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return { from: fmt(monday), to: fmt(sunday) };
}

export default function SchedulingTab({ studyPlanId }: SchedulingTabProps) {
  const [selectedRoutine, setSelectedRoutine] =
    useState<SimpleResponseRoutineDto | null>(null);
  const selectedRoutineRef = useRef<SimpleResponseRoutineDto | null>(null);
  const { openDialog, closeDialog } = useDialogStore();

  const [currentRange, setCurrentRange] = useState(getCurrentWeekRange());
  // Api hooks
  const { data: calendarData } = useCalendar({
    from: currentRange.from,
    to: currentRange.to,
    studyPlanId,
  });

  const calendar = useCalendarApp({
    locale: "vi-VN",
    timezone: "Asia/Ho_Chi_Minh",
    views: [createViewWeek()],
    plugins: [],
    dayBoundaries: { start: "07:00", end: "22:00" },
    callbacks: {
      onClickDateTime(dateTime) {
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
  }, [calendarData]);

  const { createSchedule } = useSchedule();

  const handleAddSchedule = (dateTime: Temporal.ZonedDateTime) => {
    const hour = dateTime.hour;
    const minute = dateTime.minute;
    const weekday = dateTime.dayOfWeek; // 1 (Monday) to 7 (Sunday)
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
            createSchedule.mutate({
              body: {
                routineId: Number(selectedRoutineRef.current?.id),
                durationUnit: "Minutes",
                ...values,
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
          studyPlanId={studyPlanId}
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
