import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import viLocale from "@fullcalendar/core/locales/vi";
import { useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { useCalendar } from "@/hooks/entities/useCalendar";
import { useDialogStore } from "@/stores/useDialogStore";
import { Menu, X } from "lucide-react";
import UnscheduledList from "@/components/features/calendar/UnscheduledList";
import { useTask } from "@/hooks/entities/useTask";
import { useRoutine } from "@/hooks/entities/useRoutine";
import type {
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import type {
  EventReceiveArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { formatISO } from "date-fns";
import {
  renderEventContent,
  EventPopoverContent,
} from "@/components/features/calendar/CalendarItems";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLayoutStore } from "@/stores/useLayoutStore";

// Import CSS overrides
import "./CalendarPage.css";

const taskTypeColorMap: Record<string, string> = {
  ClassSession: "#2563eb",
  SelfStudy: "#0f766e",
  AssignmentWork: "#7c3aed",
  Meeting: "#ea580c",
};

const getColor = (dto: any) => {
  const fallback =
    dto.entityType === "Schedule"
      ? "#3b82f6"
      : dto.entityType === "TimelineEvent"
        ? "#ef4444"
        : dto.taskType
          ? taskTypeColorMap[dto.taskType]
          : "#7F77DD";
  return dto.color || fallback;
};

export default function CalendarPage2() {
  const [currentRange, setCurrentRange] = useState({
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const [popoverState, setPopoverState] = useState({
    isOpen: false,
    eventData: null as any,
    anchorRect: { top: 0, left: 0, width: 0, height: 0 },
  });

  const { openDialog } = useDialogStore();
  const isInboxOpen = useLayoutStore((state) => state.isInboxOpen);
  const setIsInboxOpen = useLayoutStore((state) => state.setInboxOpen);

  const { getCalendar, getInboxItems, rescheduleCalendar } = useCalendar({
    from: currentRange.from,
    to: currentRange.to,
  });

  const { data: calendarEvents } = getCalendar();
  const { data: inboxItems } = getInboxItems;
  const { deleteTaskById } = useTask();
  const { deleteRoutine } = useRoutine();

  const handleReschedule = (info: EventDropArg | EventResizeDoneArg) => {
    const event = info.event;
    const dto = event.extendedProps;
    if (dto.entityType !== "Task" || dto.isVirtual) {
      info.revert();
      return;
    }

    const startDateTime = event.start ? formatISO(event.start) : null;
    const endDateTime = event.end ? formatISO(event.end) : null;

    if (!startDateTime || !endDateTime) {
      info.revert();
      return;
    }

    rescheduleCalendar.mutate(
      {
        body: {
          taskId: Number(dto.entityId),
          newStartDate: startDateTime,
          newEndDate: endDateTime,
        },
      },
      {
        onError: () => info.revert(),
      },
    );
  };

  const events = useMemo(() => {
    if (!calendarEvents) return [];
    return calendarEvents.map((dto: any) => {
      const startString = dto.startDateTime || dto.startAt;
      const endString = dto.endDateTime || dto.endAt;

      const isTimelineEvent = dto.entityType === "TimelineEvent";

      return {
        id: String(dto.calendarId),
        title: dto.title,
        start: startString,
        end: endString,
        allDay:
          isTimelineEvent ||
          (!startString?.includes("T") &&
            !startString?.includes(":") &&
            !isTimelineEvent),
        backgroundColor: getColor(dto),
        className: dto.status === "Completed" ? "opacity-80" : "",
        extendedProps: { ...dto },
      };
    });
  }, [calendarEvents]);

  // Thả sự kiện
  const handleEventDrop = useCallback(
    (info: any) => {
      handleReschedule(info);
    },
    [rescheduleCalendar],
  );

  // Kéo thời gian (đầu hoặc cuối sự kiện)
  const handleEventResize = useCallback(
    (info: EventResizeDoneArg) => {
      handleReschedule(info);
    },
    [rescheduleCalendar],
  );

  const handleSelect = useCallback(
    (info: any) => {
      openDialog("TASK_FORM", {
        defaultValues: {
          startDateTime: new Date(formatISO(info.start)),
          endDateTime: new Date(formatISO(info.end)),
          name: "",
          type: "SelfStudy",
        },
      });
    },
    [openDialog],
  );

  const handleEventReceive = (eventReceive: EventReceiveArg) => {
    const dto = eventReceive.event.extendedProps;

    // Gỡ bóng preview khỏi calendar ngay lập tức, data thật sẽ load từ API
    eventReceive.event.remove();

    const start = eventReceive.event.start;
    const end =
      eventReceive.event.end || new Date(start!.getTime() + 60 * 60 * 1000);

    if (!start) return;

    if (dto.entityType === "Routine") {
      const dayOfWeek = start.getDay();
      openDialog("SCHEDULE_FORM", {
        routineId: Number(eventReceive.event.id),
        defaultValues: {
          id: 0,
          dayOfWeek: dayOfWeek === 0 ? 7 : dayOfWeek, // Convert JS Sunday=0 to API Sunday=7
          startTime: format(start, "HH:mm:ss"),
          duration: dto.plannedDuration || 60,
        },
      });
    } else if (dto.entityType === "Task") {
      rescheduleCalendar.mutate({
        body: {
          taskId: Number(eventReceive.event.id),
          newStartDate: formatISO(start),
          newEndDate: formatISO(end),
        },
      });
    }
  };

  const handleEventClick = useCallback((info: EventClickArg) => {
    const dto = info.event.extendedProps;

    // Lấy tọa độ và kích thước khung (box) của event html element
    const rect = info.el.getBoundingClientRect();

    setPopoverState({
      isOpen: true,
      eventData: {
        ...dto,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
      },
      anchorRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    });
  }, []);

  const handleDatesSet = useCallback((info: any) => {
    setCurrentRange({
      from: format(info.start, "yyyy-MM-dd"),
      to: format(info.end, "yyyy-MM-dd"),
    });
  }, []);

  return (
    <div className="relative h-full overflow-hidden p-4">
      <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="timeGridWeek"
          locale={viLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
          editable={true}
          selectable={true}
          droppable={true}
          eventReceive={handleEventReceive}
          eventDrop={handleEventDrop}
          select={handleSelect}
          eventClick={handleEventClick}
          eventResize={handleEventResize}
          datesSet={handleDatesSet}
          height="100%"
          slotMinTime="00:00:00"
          nowIndicator={true}
          eventContent={renderEventContent}
        />
      </div>

      <Popover
        open={popoverState.isOpen}
        onOpenChange={(open) =>
          setPopoverState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        {/* MỎ NEO TÀNG HÌNH */}
        <PopoverTrigger asChild>
          <div
            style={{
              position: "fixed",
              top: popoverState.anchorRect.top,
              left: popoverState.anchorRect.left,
              width: popoverState.anchorRect.width,
              height: popoverState.anchorRect.height,
              pointerEvents: "none", // Xuyên chuột, không làm cản trở thao tác trên lịch
              visibility: "hidden", // Ẩn hoàn toàn
            }}
          />
        </PopoverTrigger>

        {/* NỘI DUNG POPOVER */}
        <PopoverContent
          side="right" // Ưu tiên mở sang bên phải của event
          align="start" // Ép mép trên của Popover bằng với mép trên của event
          className="w-70 p-4 shadow-lg"
        >
          {popoverState.eventData && (
            <EventPopoverContent
              eventData={popoverState.eventData}
              hidePopover={() => {
                setPopoverState((prev) => ({ ...prev, isOpen: false }));
              }}
            />
          )}
        </PopoverContent>
      </Popover>

      {!isInboxOpen && (
        <button
          onClick={() => setIsInboxOpen(true)}
          className="absolute right-4 top-20 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-40 transition-transform hover:scale-105"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <div
        className={`absolute top-0 right-0 h-full w-full max-w-80 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isInboxOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold">Hộp công việc</h3>
          <button
            onClick={() => setIsInboxOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="h-[calc(100%-60px)]">
          <UnscheduledList
            inboxItems={inboxItems}
          />
        </div>
      </div>
    </div>
  );
}
