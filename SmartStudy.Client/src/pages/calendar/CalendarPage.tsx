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
import { format } from "date-fns";
import type {
  CalendarEventAction,
  MyTask,
} from "@/components/features/calendar/DraggableCalendar";

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

  const { updateTaskInfo, deleteTaskById } = useTask();
  const { deleteRoutine } = useRoutine();
  const { confirmTaskOnOccurrence } = useSchedule();

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

  const handleDragStart = (item: UnscheduledItemDto) => {
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
      openDialog("SCHEDULE_FORM", {
        routineId: Number(draggedItem.id),
        defaultValues: {
          id: 0,
          dayOfWeek: dayOfWeek === 0 ? 7 : dayOfWeek, // Convert JS Sunday=0 to API Sunday=7
          startTime: format(new Date(start), "HH:mm:ss"),
          duration: Math.ceil(
            (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60),
          ), // duration tính bằng phút
        },
      });
    } else if (draggedItem.entityType === "Task") {
      updateTaskInfo.mutate({
        body: {
          name: draggedItem.name || "",
          description: draggedItem.description || "",
          taskDate: format(new Date(start), "yyyy-MM-dd"),
          startTime: format(new Date(start), "HH:mm:ss"),
          plannedDuration: Number(draggedItem.plannedDuration) || 60, // ← dùng duration gốc
          type: draggedItem.type || "SelfStudy",
          courseId: draggedItem.courseId || null,
          studyPlanId: Number(draggedItem.studyPlanId) || selectedStudyPlanId,
        },
        path: { taskId: Number(draggedItem.id) },
      });
    }
  };

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      openDialog("TASK_FORM", {
        studyPlanId: selectedStudyPlanId,
        defaultValues: {
          taskDate: format(start, "yyyy-MM-dd"),
          startTime: format(start, "HH:mm:ss"),
          plannedDuration: Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60),
          ), // duration tính bằng phút
          name: "",
          type: "SelfStudy",
        },
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
            plannedDuration: Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60),
            ), // duration tính bằng phút
            type: "SelfStudy", // Không có type trong calendar event, nên tạm để SelfStudy
            courseId: null, // Không có courseId trong calendar event, nên tạm để null
            studyPlanId: Number(selectedStudyPlanId),
          },
          path: {
            taskId: Number(event.entityId),
          },
        });
      }
    },
    [updateTaskInfo, selectedStudyPlanId],
  );

  const handleEventAction = useCallback(
    ({ type, event }: CalendarEventAction) => {
      if (type === "log-work") {
        if (!event.entityId) return;
        openDialog("LOG_WORK_FORM", {
          taskId: Number(event.entityId),
          defaultValues: {
            actualDuration:
              Math.ceil(
                (event.end.getTime() - event.start.getTime()) / (1000 * 60),
              ) || 60,
            note: "",
            markAsCompleted: false,
          },
        });
        return;
      }

      if (type === "delete-task") {
        if (!event.entityId) return;
        openDialog("CONFIRM_DELETE", {
          itemType: "công việc",
          itemName: event.title,
          onConfirm: () => {
            deleteTaskById.mutate({
              path: {
                taskId: Number(event.entityId),
              },
            });
          },
        });
        return;
      }

      if (type === "confirm-schedule") {
        if (!event.entityId) return;
        confirmTaskOnOccurrence.mutate({
          path: {
            id: Number(event.entityId),
          },
          query: {
            taskDate: format(event.start, "yyyy-MM-dd"),
          },
        });
        return;
      }

      if (type === "edit-schedule") {
        if (!event.entityId || !event.routineId) return;

        openDialog("SCHEDULE_FORM", {
          routineId: Number(event.routineId),
          defaultValues: {
            id: Number(event.entityId),
            dayOfWeek: event.start.getDay(),
            startTime: format(event.start, "HH:mm:ss"),
            duration:
              Math.ceil(
                (event.end.getTime() - event.start.getTime()) / (1000 * 60),
              ) || 60,
            location: "",
          },
        });

        return;
      }

      if (type === "edit-routine") {
        if (!event.routineId) return;

        openDialog("ROUTINE_FORM", {
          studyPlanId: selectedStudyPlanId,
          routineId: Number(event.routineId),
        });
      }
    },
    [confirmTaskOnOccurrence, deleteTaskById, openDialog, selectedStudyPlanId],
  );

  const handleDeleteUnscheduledItem = (item: UnscheduledItemDto) => {
    if (item.entityType === "Routine") {
      openDialog("CONFIRM_DELETE", {
        itemType: "lịch trình",
        itemName: item.name || "Lịch trình chưa đặt tên",
        onConfirm: () => {
          // Gọi API xóa thói quen
          deleteRoutine.mutate({ path: { id: Number(item.id) } });
        },
      });
    } else if (item.entityType === "Task") {
      openDialog("CONFIRM_DELETE", {
        itemType: "công việc",
        itemName: item.name || "Công việc chưa đặt tên",
        onConfirm: () => {
          deleteTaskById.mutate({ path: { taskId: Number(item.id) } });
        },
      });
    }
  };

  return (
    <div className="relative h-full overflow-hidden p-4">
      <div className="min-h-0">
        <DraggableCalendar
          key={`${currentRange.from}-${currentRange.to}`}
          calendarEvents={calendarEvents ?? []}
          onRangeChange={handleRangeChange}
          currentDate={currentDate} // ← truyền xuống
          onNavigate={setCurrentDate} // ← RBC gọi khi next/back/today
          onSelectSlot={handleSelectSlot}
          draggedItem={draggedItem ?? undefined}
          onDropFromOutside={handleDropOnCalendar}
          onEventChange={handleEventChange}
          onEventAction={handleEventAction}
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
        className={`absolute top-0 right-0 h-full w-full max-w-80 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
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
            onDelete={handleDeleteUnscheduledItem} // ← truyền hàm xóa vào đây
          />
        </div>
      </div>
    </div>
  );
}
