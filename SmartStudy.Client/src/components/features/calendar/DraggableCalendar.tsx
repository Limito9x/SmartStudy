import { useCallback } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";
import { addMinutes } from "date-fns";

// BẮT BUỘC PHẢI IMPORT 2 FILE CSS NÀY (Nếu bác xài Nextjs thì bỏ vào global.css hoặc layout)
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import type {
  CalendarEntityType,
  CalendarEventDto,
  TaskStatus,
} from "@/services/api";

interface DraggableCalendarProps {
  calendarEvents: CalendarEventDto[];
  onRangeChange: (from: string, to: string) => void;
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onSelectSlot?: (slot: { start: Date; end: Date }) => void;
  draggedItem?: any; // Thông tin item đang bị kéo (nếu có)
  onDropFromOutside?: (args: {
    start: Date | string;
    end: Date | string;
  }) => void; // Hàm gọi khi thả item từ ngoài vào
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
interface MyTask extends Event {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  status?: TaskStatus | null;
  isVirtual?: boolean; // Dùng để phân biệt Task ảo (chỉ hiển thị trên UI, không tồn tại thật trong DB)
  entityId?: number | string;
  entityType?: CalendarEntityType;
  routineId?: number | string | null; // Nếu event này là 1 Routine, thì lưu ID của nó để dễ update sau này
}

export default function DraggableCalendar({
  calendarEvents,
  onRangeChange,
  currentDate,
  onNavigate,
  onSelectSlot,
  draggedItem,
  onDropFromOutside,
}: DraggableCalendarProps) {
  const events: MyTask[] = calendarEvents.map((e) => {
    const [year, month, day] = e.date!.split("-").map(Number);

    // TimelineEvent không có startTime → all-day
    if (e.entityType === "TimelineEvent") {
      return {
        id: e.calendarId ?? `${e.entityType}-${e.entityId}-${e.date}`,
        title: e.title ?? "",
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day),
        allDay: true, // ← hiện ở row all-day
        isVirtual: false,
        entityId: e.entityId,
        entityType: e.entityType,
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
    };
  });

  // 1. KÉO ĐỔI THỜI GIAN TASK (RESIZE)
  const onEventResize: withDragAndDropProps["onEventResize"] =
    useCallback(() => {
      // GỌI API UPDATE THỜI GIAN Ở ĐÂY
    }, []);

  // 2. KÉO THẢ DI CHUYỂN TASK SANG Ô KHÁC (DROP)
  const onEventDrop: withDragAndDropProps["onEventDrop"] = useCallback(() => {
    // GỌI API UPDATE THỜI GIAN Ở ĐÂY
  }, []);

  // 3. KÉO CHUỘT TRÊN LƯỚI TRỐNG ĐỂ TẠO TASK MỚI (SELECT SLOT)
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      onSelectSlot?.({ start, end });
    },
    [onSelectSlot],
  );

  // TƯƠNG TÁC: CLICK VÀO TASK ĐỂ SỬA/XÓA
  const onSelectEvent = useCallback(
    (event: object, _e: React.SyntheticEvent) => {
      const myTask = event as MyTask;
      alert(`Bạn vừa click vào: ${myTask.title}`);
      // Mở Form Sửa Task truyền event.id vào
    },
    [],
  );

  const handleDragFromOutsideItem = () => {
    return draggedItem;
  };

  // HIỆU ỨNG: CUSTOM MÀU SẮC DỰA VÀO LOẠI TASK (Routine hay Task thường)
  const eventPropGetter = useCallback((event: object) => {
    const task = event as MyTask;

    const colorMap = {
      Task: task.status === "Completed" ? "#94a3b8" : "#7F77DD",
      Schedule: "#3b82f6", // routine ảo — xanh
      TimelineEvent: "#ef4444", // deadline — đỏ
    };

    const bg = colorMap[task.entityType as keyof typeof colorMap] ?? "#7F77DD";
    const opacity = task.isVirtual ? 0.5 : 0.9; // ảo thì mờ hơn

    return {
      style: {
        backgroundColor: bg,
        opacity,
        border: "none",
        borderRadius: "6px",
        color: "white",
      },
    };
  }, []);

  // RBC gọi cái này khi user bấm next/prev/today
  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      let from: Date, to: Date;

      if (Array.isArray(range)) {
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

  return (
    <div className="h-200 w-full bg-white p-4 rounded-xl shadow">
      <DnDCalendar
        localizer={localizer}
        events={events}
        culture="vi"
        defaultView="week"
        views={["week"]}
        step={30} // Mỗi ô lưới là 30 phút
        timeslots={2} // 1 giờ chia làm 2 ô
        // Bật tính năng Drag/Drop/Resize
        selectable={true}
        resizable={true}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectSlot={handleSelectSlot}
        // Tương tác & Giao diện
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventPropGetter}
        onRangeChange={handleRangeChange}
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
  );
}
