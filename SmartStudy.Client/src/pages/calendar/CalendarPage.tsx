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
import { Menu, X } from "lucide-react"; // Icon cái nút Hamburger và nút Đóng
import ScheduleForm from "@/components/forms/schedule/ScheduleForm";
import { scheduleApiMapper, taskApiMapper } from "@/utils/mapper.ts/apiMapper";
import { format } from "date-fns";
import type { MyTask } from "@/components/features/calendar/DraggableCalendar";

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
  const [draggedItem, setDraggedItem] = useState<UnscheduledItemDto | null>(
    null,
  );
  const { openDialog } = useDialogStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { getAllStudyPlans } = useStudyPlan();
  const { data: studyPlans } = getAllStudyPlans;

  const { getCalendar, getUnscheduledItems } = useCalendar();

  const { updateTaskInfo } = useTask();
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

  const handleDropOnCalendar = async (args: {
    start: Date | string;
    end: Date | string;
  }) => {
    if (!draggedItem) return;
    const { start, end } = args;
    const dayOfWeek = new Date(start).getDay();

    if (draggedItem.entityType === "Routine") {
      
    }
    else if (draggedItem.entityType === "Task") {
      updateTaskInfo.mutate({
        body: {
          name: draggedItem.name || "",
          description: draggedItem.description || "",
          taskDate: format(new Date(start), "yyyy-MM-dd"),
          startTime: format(new Date(start), "HH:mm:ss"),
          plannedDuration: Number(draggedItem.plannedDuration), // duration tính bằng phút
          type: draggedItem.type || "SelfStudy",
          courseId: draggedItem.courseId || null,
          studyPlanId: Number(draggedItem.studyPlanId) || selectedStudyPlanId,
        },
        path:{
          taskId: Number(draggedItem.id)
        }
      })
    }
  };

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      openDialog("TASK_FORM", {
        studyPlanId: selectedStudyPlanId,
        defaultValues: {
          taskDate: format(start, "yyyy-MM-dd"),
          startTime: format(start, "HH:mm:ss"),
          plannedDuration: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)), // duration tính bằng phút
          name: "",
          type: "SelfStudy",
        }
      });
    },
    [openDialog, selectedStudyPlanId],
  );

  const handleEventChange = useCallback(
    ({ event, start, end }: { event: MyTask; start: Date; end: Date }) => {
      if (event.entityType === "Task") {
        updateTaskInfo.mutate({
          body: {
            name: event.title,
            description: "", // Không có description trong calendar event, nên tạm để trống
            taskDate: format(new Date(start), "yyyy-MM-dd"),
            startTime: format(new Date(start), "HH:mm:ss"),
            plannedDuration: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)), // duration tính bằng phút
            type: "SelfStudy", // Không có type trong calendar event, nên tạm để SelfStudy
            courseId: null, // Không có courseId trong calendar event, nên tạm để null
            studyPlanId: Number(selectedStudyPlanId),
          },
          path: {
            taskId: Number(event.entityId)
          }
        });
      }
    },
    [updateTaskInfo, selectedStudyPlanId],
  );

  return (
    <div className="relative p-4 h-full flex flex-col overflow-hidden">

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
            onEventChange={handleEventChange}
          />
        </div>
        {/* NÚT BẤM GỌI DRAWER (Nổi ở góc phải) */}
        {!isDrawerOpen && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="absolute right-4 top-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-40 transition-transform hover:scale-105"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* DRAWER NỔI (OVERLAY) */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header của Drawer có nút [X] để đóng thủ công */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold">Hộp công việc</h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="h-[calc(100%-60px)]">
            <UnscheduledList
              items={unscheduledItems}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
    </div>
  );
}
