import CreateCalendarEntryDialog from "@/components/features/calendar/CreateCalendarEntryDialog";
import DraggableCalendar from "@/components/features/calendar/DraggableCalendar";
import { useCalendar } from "@/hooks/entities/useCalendar";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import { useTask } from "@/hooks/entities/useTask";
import { useRoutine } from "@/hooks/entities/useRoutine";
import { useSchedule } from "@/hooks/entities/useSchedule";
import { useDialogStore } from "@/stores/useDialogStore";
import { useCallback, useMemo, useState } from "react";
import UnscheduledList from "@/components/features/calendar/UnscheduledList";
import type { UnscheduledItemDto } from "@/services/api";

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

// CalendarPage.tsx
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentRange, setCurrentRange] = useState(getCurrentWeekRange());
  const [draggedItem, setDraggedItem] = useState<UnscheduledItemDto | null>(null);
  const { openDialog } = useDialogStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const { getAllStudyPlans } = useStudyPlan();
  const { data: studyPlans } = getAllStudyPlans;

  const { getCalendar, getUnscheduledItems } = useCalendar();

  const { createTask } = useTask();
  const { createSchedule } = useSchedule();

  const { data: calendarEvents } = getCalendar({
    from: currentRange.from,
    to: currentRange.to,
  });

  const { data: unscheduledItems } = getUnscheduledItems;

  const selectedStudyPlanId = useMemo(() => {
    const activePlan = studyPlans?.find((plan) => plan.status === "Active");
    const fallback = studyPlans?.[0];
    const value = activePlan?.id ?? fallback?.id;

    return typeof value === "number" ? value : Number(value);
  }, [studyPlans]);

  const handleRangeChange = (from: string, to: string) => {
    setCurrentRange({ from, to });
  };

  const handleDragStart = (item: any) => {
    setDraggedItem(item);
    setTimeout(() => setIsDrawerOpen(false), 0);
  };

  const handleDragEnd = () => {
    setIsDrawerOpen(true);
  };

  const handleDropOnCalendar = async (args: { start: Date | string; end: Date | string }) => {
    if(!draggedItem) return;
    const { start, end } = args;
    const dayOfWeek = new Date(start).getDay();

    if(draggedItem.entityType==="Routine"){
      createSchedule.mutate({
        body: {
          routineId: Number(draggedItem.id),
          dayOfWeek: dayOfWeek === 0 ? 7 : dayOfWeek, // Chuyển Sunday=0 thành 7 để phù hợp với backend
          startTime: start instanceof Date ? start.toTimeString().slice(0, 5) : "",
          duration: 60, // Mặc định 1 tiếng, có thể cải tiến sau bằng cách cho user chọn khi thả
          location: "",
        }
      })
    }
  }

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      openDialog({
        title: "Thêm từ lịch",
        description:
          "Tạo nhanh nhiệm vụ một lần hoặc lịch lặp lại từ ô thời gian đã chọn.",
        view: (
          <CreateCalendarEntryDialog
            studyPlanId={
              Number.isNaN(selectedStudyPlanId)
                ? undefined
                : selectedStudyPlanId
            }
            selectedStart={start}
            selectedEnd={end}
          />
        ),
      });
    },
    [openDialog, selectedStudyPlanId],
  );

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex">
        <div className="flex-1 overflow-hidden">
          <DraggableCalendar
            key={`${currentRange.from}-${currentRange.to}`}
            calendarEvents={calendarEvents ?? []}
            onRangeChange={handleRangeChange}
            currentDate={currentDate} // ← truyền xuống
            onNavigate={setCurrentDate} // ← RBC gọi khi next/back/today
            onSelectSlot={handleSelectSlot}
            draggedItem={draggedItem}
            onDropFromOutside={handleDropOnCalendar}
          />
        </div>
        <div
          className={`border-l border-gray-200 transition-all duration-300 ease-in-out ${
            isDrawerOpen ? "w-60 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-60 h-full">
            {" "}
            {/* Cố định width bên trong để không bị vỡ chữ khi co lại */}
            <UnscheduledList
              items={unscheduledItems}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
