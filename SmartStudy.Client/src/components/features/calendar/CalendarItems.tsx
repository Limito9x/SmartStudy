import type { EventContentArg } from "@fullcalendar/core/index.js";
import { MapPin } from "lucide-react";
import { formatTaskDateTime } from "@/utils/dateUtils";
import { renderTaskIcon, getStatusStyle } from "../task/FormatTask";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, BookOpen, Repeat, ClockAlert } from "lucide-react";
import { useTask } from "@/hooks/entities/useTask";
import { useRoutine } from "@/hooks/entities/useRoutine";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";

export const renderEventContent = (info: EventContentArg) => {
  const dto = info.event.extendedProps;
  const isCompleted = dto.status === "Completed";
  const isOverdue = dto.isOverdue;

  const isRoutine = dto.routineId !=null || dto.isVirtual;

  return (
    <div className="flex flex-col p-1 text-xs overflow-hidden leading-tight w-full">
      {/* Tên công việc (in đậm) */}
      <div className="flex items-start gap-1">
        {isCompleted && (
          // Icon Tick xanh (nhỏ, bo tròn) nằm bên trái
          <CheckCircle2 className="w-3.5 h-3.5 text-green-900 shrink-0 mt-px" />
        )}
        {isOverdue && (
          // Icon Đồng hồ đỏ (nhỏ, bo tròn) nằm bên trái, thay thế cho icon tick nếu công việc đã quá hạn
          <ClockAlert className="w-5 h-5 text-red-600 shrink-0 mt-px" />
        )}
        <span
          className={`font-semibold truncate ${
            isCompleted ? "line-through text-gray-800" : ""
          }`}
        >
          {info.event.title}
        </span>

        {isRoutine && (
          <Repeat
            className="w-4 h-4 shrink-0 mt-0.5 "
            aria-label="Lịch trình lặp lại"
          />
        )}
      </div>

      {/* Dòng thứ 2: Thời gian - FullCalendar tự sinh ra trong eventInfo.timeText */}
      <span className="opacity-90 text-[10px] truncate">{info.timeText}</span>

      {/* Dòng thứ 3: Địa điểm (Nếu có) */}
      {dto.location && (
        <span className="flex items-center gap-1 text-[10px] mt-0.5 truncate opacity-90">
          <MapPin className="w-3 h-3" />
          {dto.location}
        </span>
      )}
    </div>
  );
};

export const eventPopoverContent = (eventData: any) => {
  const statusStyle = getStatusStyle(eventData.status);
  const isRoutine = eventData.routineId != null || eventData.isVirtual;

  return (
    <div className="flex flex-col space-y-3">
      {" "}
      {/* Tăng khoảng cách các dòng một chút cho thoáng */}
      {/* KHỐI TIÊU ĐỀ: Icon + Tên (bên trái) và Badge (bên phải) */}
      <div className="flex items-start justify-between gap-3">
        {/* Cụm Icon và Tên Task */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {" "}
          {/* min-w-0 để hỗ trợ truncate nếu tên quá dài */}
          <div className="mt-1 text-gray-500 shrink-0">
            {eventData.taskType && renderTaskIcon(eventData.taskType)}
          </div>
          <h4 className="font-semibold text-base leading-tight wrap-break-words">
            {eventData.title}
          </h4>
        </div>
        {isRoutine && (
          <Repeat
            className="w-4 h-4 shrink-0 mt-0.5 text-gray-400"
            aria-label="Lịch trình lặp lại"
          />
        )}


        {/* Badge Trạng thái: Nằm trên cùng bên phải */}
        <Badge className={cn("border shrink-0 mt-0.5", statusStyle.badgeClass)}>
          {statusStyle.label}
        </Badge>
      </div>
      {/* KHỐI THỜI GIAN & MÔN HỌC */}
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-gray-600 flex items-center gap-1.5">
          {/* Thêm cái icon đồng hồ nhỏ vào cho xịn */}
          <Clock className="w-3 h-3 text-gray-400" />
          {formatTaskDateTime(eventData.startAt, eventData.endAt)}
        </span>

        {eventData.courseName && (
          <span className="text-sm text-gray-600 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-gray-400" />
            <span className="truncate">Môn học: {eventData.courseName}</span>
          </span>
        )}
      </div>
      {/* KHỐI NÚT BẤM */}
      <div className="flex flex-col mt-3 pt-2 border-t border-gray-100 -mx-2 gap-2">
        <button
          className="text-sm text-gray-600 hover:text-blue-600 hover:underline font-medium transition-colors"
          onClick={() => {
            /* Gọi Dialog Edit ở đây */
          }}
        >
          Chỉnh sửa
        </button>
        <button
          className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-medium transition-colors shadow-sm"
          onClick={() => {
            /* Gọi form ghi tiến độ ở đây */
          }}
        >
          Ghi tiến độ
        </button>
      </div>
    </div>
  );
};
