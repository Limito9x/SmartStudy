import { useCallback, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type Event,
  type View,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import {
  addDays,
  addMinutes,
  format,
  getDay,
  parse,
  startOfWeek,
  subDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Flag,
  Link2,
  Repeat,
  Users,
} from "lucide-react";

// BẮT BUỘC PHẢI IMPORT 2 FILE CSS NÀY (Nếu bác xài Nextjs thì bỏ vào global.css hoặc layout)
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import type {
  CalendarEntityType,
  CalendarEventDto,
  TaskStatus,
  TaskType,
} from "@/services/api";

interface DraggableCalendarProps {
  calendarEvents: CalendarEventDto[];
  onRangeChange: (from: string, to: string) => void;
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onSelectSlot?: (slot: { start: Date; end: Date }) => void;
  draggedItem?: DraggedOutsideItem; // Thông tin item đang bị kéo (nếu có)
  onDropFromOutside?: (args: {
    start: Date | string;
    end: Date | string;
  }) => void; // Hàm gọi khi thả item từ ngoài vào
  onEventChange?: ({
    event,
    start,
    end,
  }: {
    event: MyTask;
    start: Date;
    end: Date;
  }) => void; // Hàm gọi khi có sự thay đổi về event (di chuyển, resize)
  onEventAction?: (action: CalendarEventAction) => void;
}

export interface CalendarEventAction {
  type:
    | "log-work"
    | "delete-task"
    | "confirm-schedule"
    | "edit-schedule"
    | "edit-routine";
  event: MyTask;
}

type DragChangeArgs = {
  event: object;
  start: Date | string;
  end: Date | string;
};

interface DraggedOutsideItem {
  title?: string;
  name?: string;
  plannedDuration?: number | string | null;
}

interface CalendarEventDtoWithSchedule extends CalendarEventDto {
  scheduleId?: number | string | null;
}

// Cấu hình tiếng Việt và format ngày tháng cho Calendar
const locales = { vi: vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Tuần bắt đầu bằng Thứ 2
  getDay,
  locales,
});

// Bọc Calendar bằng HOC DragAndDrop
const DnDCalendar = withDragAndDrop(Calendar);

// Mở rộng interface Event của RBC để chứa thêm data tùy chuẩn (Ví dụ: isRoutine)
export interface MyTask extends Event {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  status?: TaskStatus | null;
  isVirtual?: boolean; // Dùng để phân biệt Task ảo (chỉ hiển thị trên UI, không tồn tại thật trong DB)
  entityId?: number | string;
  entityType?: CalendarEntityType;
  routineId?: number | string | null; // Nếu event này là 1 Routine, thì lưu ID của nó để dễ update sau này
  scheduleId?: number | string | null;
  color: string; // Màu sắc riêng cho từng event, sẽ được dùng trong eventPropGetter để custom style
  courseId?: number | null; // Thêm courseId nếu cần để hiển thị thông tin liên quan đến khóa học trên event (như tooltip)
  taskType: TaskType | null; // Thêm taskType để phân biệt loại Task (SelfStudy, Assignment, Exam) nếu cần hiển thị khác nhau trên calendar
}

const taskTypeColorMap: Record<TaskType, string> = {
  ClassSession: "#2563eb",
  SelfStudy: "#0f766e",
  AssignmentWork: "#7c3aed",
  Meeting: "#ea580c",
  Milestone: "#be123c",
};

function occurrenceDateKey(task: MyTask) {
  return format(task.start, "yyyy-MM-dd");
}

function occurrenceTimeKey(task: MyTask) {
  return format(task.start, "HH:mm:ss");
}

function occurrenceKeyBySchedule(task: MyTask) {
  if (!task.routineId || !task.scheduleId) return null;
  return `${task.routineId}|${task.scheduleId}|${occurrenceDateKey(task)}`;
}

function occurrenceKeyByTime(task: MyTask) {
  if (!task.routineId) return null;
  return `${task.routineId}|${occurrenceTimeKey(task)}|${occurrenceDateKey(task)}`;
}

function getIconForTask(task: MyTask) {
  if (task.entityType === "Schedule" || task.isVirtual) {
    return <Repeat className="h-3.5 w-3.5" />;
  }

  if (task.entityType === "Task" && task.routineId) {
    return <Link2 className="h-3.5 w-3.5" />;
  }

  if (task.entityType === "Task") {
    if (task.taskType === "Milestone")
      return <Flag className="h-3.5 w-3.5" />;
    if (task.taskType === "ClassSession")
      return <BookOpen className="h-3.5 w-3.5" />;
    if (task.taskType === "AssignmentWork")
      return <ClipboardCheck className="h-3.5 w-3.5" />;
    if (task.taskType === "Meeting") return <Users className="h-3.5 w-3.5" />;
    return <Clock3 className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
}

function CalendarEventContent({ event }: { event: MyTask }) {
  return (
    <div className="flex w-full items-center gap-1">
      <span className="shrink-0">{getIconForTask(event)}</span>
      <span className="truncate text-xs font-medium">{event.title}</span>
      {event.status === "Completed" && (
        <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0" />
      )}
    </div>
  );
}

export default function DraggableCalendar({
  calendarEvents,
  onRangeChange,
  currentDate,
  onNavigate,
  onSelectSlot,
  draggedItem,
  onDropFromOutside,
  onEventChange,
  onEventAction,
}: DraggableCalendarProps) {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"day" | "week">("day");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const calendarView: View = isMobile ? mobileView : "week";

  const mappedEvents: MyTask[] = calendarEvents.map((rawEvent) => {
    const e = rawEvent as CalendarEventDtoWithSchedule;
    const [year, month, day] = e.date!.split("-").map(Number);

    // TimelineEvent không có startTime → all-day
    if (e.entityType === "TimelineEvent") {
      return {
        id: e.calendarId ?? `${e.entityType}-${e.entityId}-${e.date}`,
        title: e.title ?? "",
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day),
        allDay: true, // ← hiện ở row all-day
        color: e.color ?? "#7F77DD",
        courseId: Number(e.courseId),
        isVirtual: false,
        entityId: e.entityId,
        entityType: e.entityType,
        routineId: e.routineId,
        scheduleId: null,
        taskType: null,
      };
    }

    const startStr = `${e.date}T${e.startTime ?? "00:00:00"}`;
    const start = new Date(startStr);
    const end = addMinutes(start, Number(e.duration) || 60);

    return {
      id: e.calendarId ?? `${e.entityType}-${e.entityId}-${e.date}`,
      title: e.title ?? "",
      status: e.status,
      start,
      end, // ← Date object trực tiếp, không cần template string
      isVirtual: e.isVirtual,
      entityId: e.entityId,
      entityType: e.entityType,
      routineId: e.routineId,
      scheduleId: e.scheduleId ?? null,
      color: e.color ?? "#7F77DD",
      courseId: Number(e.courseId),
      taskType: e.taskType || null,
    };
  });

  const generatedTaskKeys = new Set<string>();
  mappedEvents.forEach((event) => {
    const isGeneratedTask =
      event.entityType === "Task" && !event.isVirtual && !!event.routineId;
    if (!isGeneratedTask) return;

    const scheduleKey = occurrenceKeyBySchedule(event);
    const timeKey = occurrenceKeyByTime(event);
    if (scheduleKey) generatedTaskKeys.add(scheduleKey);
    if (timeKey) generatedTaskKeys.add(timeKey);
  });

  const events = mappedEvents.filter((event) => {
    const isVirtualSchedule =
      event.entityType === "Schedule" && !!event.isVirtual;
    if (!isVirtualSchedule) return true;

    const normalizedVirtual = {
      ...event,
      scheduleId: event.scheduleId ?? event.entityId ?? null,
    } as MyTask;

    const scheduleKey = occurrenceKeyBySchedule(normalizedVirtual);
    const timeKey = occurrenceKeyByTime(normalizedVirtual);

    return !(
      (scheduleKey && generatedTaskKeys.has(scheduleKey)) ||
      (timeKey && generatedTaskKeys.has(timeKey))
    );
  });

  // 1. KÉO ĐỔI THỜI GIAN TASK (RESIZE)
  const onEventResize: withDragAndDropProps["onEventResize"] = useCallback(
    ({ event, start, end }: DragChangeArgs) => {
      const currentEvent = event as MyTask;
      if (currentEvent.isVirtual || currentEvent.entityType !== "Task") {
        // Không drag được — nhưng không báo lỗi
        // Chỉ cần không làm gì → RBC tự revert
        return;
      }
      // Chỉ cần "báo cáo" lên trên
      if (onEventChange) {
        onEventChange({
          event: currentEvent,
          start: new Date(start),
          end: new Date(end),
        });
      }
    },
    [onEventChange],
  );

  // 2. KÉO THẢ DI CHUYỂN TASK SANG Ô KHÁC (DROP)
  const onEventDrop: withDragAndDropProps["onEventDrop"] = useCallback(
    ({ event, start, end }: DragChangeArgs) => {
      const currentEvent = event as MyTask;
      if (currentEvent.isVirtual || currentEvent.entityType !== "Task") {
        return;
      }

      // Y chang ở trên, chỉ báo cáo lên trên
      if (onEventChange) {
        onEventChange({
          event: currentEvent,
          start: new Date(start),
          end: new Date(end),
        });
      }
    },
    [onEventChange],
  );

  // 3. KÉO CHUỘT TRÊN LƯỚI TRỐNG ĐỂ TẠO TASK MỚI (SELECT SLOT)
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      onSelectSlot?.({ start, end });
    },
    [onSelectSlot],
  );

  // TƯƠNG TÁC: CLICK VÀO TASK ĐỂ SỬA/XÓA
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    event: MyTask;
  } | null>(null);

  const onSelectEvent = useCallback(
    (event: object, e: React.SyntheticEvent) => {
      const myTask = event as MyTask;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuState({
        x: rect.left + rect.width / 2,
        y: rect.bottom,
        event: myTask,
      });
    },
    [],
  );

  // DraggableCalendar.tsx
  const handleDragFromOutsideItem = useCallback(() => {
    if (!draggedItem) return {};
    return {
      title: draggedItem.title || draggedItem.name || "",
      duration: Number(draggedItem.plannedDuration) || 60,
    };
  }, [draggedItem]);

  // HIỆU ỨNG: CUSTOM MÀU SẮC DỰA VÀO LOẠI TASK (Routine hay Task thường)
  const eventPropGetter = useCallback((event: object) => {
    const task = event as MyTask;

    const fallback =
      task.entityType === "Schedule"
        ? "#3b82f6"
        : task.entityType === "TimelineEvent"
          ? "#ef4444"
          : task.taskType
            ? taskTypeColorMap[task.taskType]
            : "#7F77DD";

    const bg = task.color || fallback;
    const opacity = task.isVirtual ? 0.72 : 0.92;
    const isGeneratedTask = task.entityType === "Task" && !!task.routineId;
    const isCompleted = task.status === "Completed";
    const isMilestone = task.taskType === "Milestone";

    return {
      style: {
        backgroundColor: bg,
        opacity,
        border: task.isVirtual
          ? "2px dashed rgba(255,255,255,0.65)"
          : isMilestone
            ? "2px solid rgba(255,255,255,0.8)"
            : "1px solid rgba(255,255,255,0.15)",
        borderLeft: isMilestone
          ? "4px solid #fff"
          : isGeneratedTask
            ? "4px solid rgba(15,23,42,0.5)"
            : undefined,
        borderRadius: "6px",
        color: "white",
        filter: isCompleted ? "saturate(0.45)" : undefined,
        boxShadow: isMilestone
          ? "0 0 8px rgba(190,18,60,0.55)"
          : undefined,
        fontWeight: isMilestone ? "600" : undefined,
      },
    };
  }, []);

  // RBC gọi cái này khi user bấm next/prev/today
  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date } | Date) => {
      let from: Date, to: Date;

      if (range instanceof Date) {
        from = range;
        to = range;
      } else if (Array.isArray(range)) {
        from = range[0];
        to = range[range.length - 1];
      } else {
        from = range.start;
        to = range.end;
      }

      onRangeChange(format(from, "yyyy-MM-dd"), format(to, "yyyy-MM-dd"));
    },
    [onRangeChange], // ← thêm dependency
  );

  const navigateByOffset = useCallback(
    (offset: number) => {
      const nextDate =
        calendarView === "week"
          ? addDays(currentDate, 7 * offset)
          : addDays(currentDate, offset);
      onNavigate(nextDate);
    },
    [calendarView, currentDate, onNavigate],
  );

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobile || calendarView !== "day") return;
      setTouchStartX(event.changedTouches[0]?.clientX ?? null);
    },
    [calendarView, isMobile],
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isMobile || calendarView !== "day" || touchStartX === null) return;
      const touchEndX = event.changedTouches[0]?.clientX;
      if (typeof touchEndX !== "number") return;

      const deltaX = touchEndX - touchStartX;
      const SWIPE_THRESHOLD = 60;

      if (deltaX >= SWIPE_THRESHOLD) {
        onNavigate(subDays(currentDate, 1));
      }
      if (deltaX <= -SWIPE_THRESHOLD) {
        onNavigate(addDays(currentDate, 1));
      }
      setTouchStartX(null);
    },
    [calendarView, currentDate, isMobile, onNavigate, touchStartX],
  );

  const mobileWeekClass =
    isMobile && calendarView === "week" ? "min-w-[980px]" : "";

  return (
    <div className="w-full rounded-xl bg-white p-3 shadow md:p-4">
      {isMobile && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              type="button"
              size="sm"
              variant={calendarView === "day" ? "default" : "ghost"}
              onClick={() => setMobileView("day")}
            >
              Ngày
            </Button>
            <Button
              type="button"
              size="sm"
              variant={calendarView === "week" ? "default" : "ghost"}
              onClick={() => setMobileView("week")}
            >
              Tuần
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => navigateByOffset(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => navigateByOffset(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {menuState && (
        <DropdownMenu
          open={!!menuState}
          onOpenChange={(open) => {
            if (!open) setMenuState(null);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="pointer-events-none fixed z-40 h-1 w-1 opacity-0"
              style={{ left: menuState.x, top: menuState.y }}
              aria-hidden
              tabIndex={-1}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-50 w-56"
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={12}
          >
            <DropdownMenuLabel className="max-w-52 truncate">
              {menuState.event.title}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuState.event.isVirtual ? (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    onEventAction?.({
                      type: "confirm-schedule",
                      event: menuState.event,
                    });
                    setMenuState(null);
                  }}
                >
                  Tạo công việc cho buổi này
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onEventAction?.({
                      type: "edit-schedule",
                      event: menuState.event,
                    });
                    setMenuState(null);
                  }}
                >
                  Sửa khung giờ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onEventAction?.({
                      type: "edit-routine",
                      event: menuState.event,
                    });
                    setMenuState(null);
                  }}
                >
                  Sửa thông tin gốc
                </DropdownMenuItem>
              </>
            ) : menuState.event.entityType === "TimelineEvent" ? (
              <DropdownMenuItem disabled>Sự kiện</DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    onEventAction?.({
                      type: "log-work",
                      event: menuState.event,
                    });
                    setMenuState(null);
                  }}
                >
                  Ghi nhận công việc
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    onEventAction?.({
                      type: "delete-task",
                      event: menuState.event,
                    });
                    setMenuState(null);
                  }}
                >
                  Xoa
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="h-[70vh] min-h-140 max-h-245 overflow-y-auto overscroll-contain md:h-[78vh] md:min-h-175">
        <div
          className={cn(
            "h-full",
            isMobile && calendarView === "week" && "overflow-x-auto",
          )}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className={cn("h-full", mobileWeekClass)}>
            <DnDCalendar
              localizer={localizer}
              events={events}
              culture="vi"
              view={calendarView}
              views={isMobile ? ["day", "week"] : ["week"]}
              step={30} // Mỗi ô lưới là 30 phút
              timeslots={2} // 1 giờ chia làm 2 ô
              // Bật tính năng Drag/Drop/Resize
              selectable={true}
              resizable={true}
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              onSelectSlot={handleSelectSlot}
              draggableAccessor={(event) => {
                const e = event as MyTask;
                return !(e.isVirtual || e.entityType == "TimelineEvent"); // chỉ task thật mới drag được
              }}
              resizableAccessor={(event) => {
                const e = event as MyTask;
                return !e.isVirtual && e.entityType === "Task";
              }}
              // Tương tác & Giao diện
              onSelectEvent={onSelectEvent}
              eventPropGetter={eventPropGetter}
              components={{
                event: ({ event }) => (
                  <CalendarEventContent event={event as MyTask} />
                ),
              }}
              onRangeChange={handleRangeChange}
              onView={(nextView) => {
                if (nextView === "day" || nextView === "week") {
                  setMobileView(nextView);
                }
              }}
              date={currentDate}
              onNavigate={onNavigate}
              min={new Date(0, 0, 0, 7, 0, 0)}
              max={new Date(0, 0, 0, 23, 0, 0)}
              scrollToTime={new Date(0, 0, 0, 7, 0, 0)} // auto scroll đến 7h khi mở
              // Bật tính năng nhận đồ từ bên ngoài:
              dragFromOutsideItem={handleDragFromOutsideItem}
              onDropFromOutside={onDropFromOutside}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
