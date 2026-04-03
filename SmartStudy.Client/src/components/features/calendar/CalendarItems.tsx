import type { EventContentArg } from "@fullcalendar/core/index.js";
import { MapPin, Pencil, PlayCircle, StopCircle, Trash2 } from "lucide-react";
import { formatTaskDateTime } from "@/utils/dateUtils";
import { renderTaskIcon, getStatusStyle } from "../task/FormatTask";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Repeat,
  ClockAlert,
  Logs,
} from "lucide-react";
import { useDialogStore } from "@/stores/useDialogStore";
import { Button } from "@/components/ui/button";
import { useTask } from "@/hooks/entities/useTask";
import { useRoutine } from "@/hooks/entities/useRoutine";
import { useTimelineEvent } from "@/hooks/entities/useTimelineEvent";
import { toast } from "sonner";

export const renderEventContent = (info: EventContentArg) => {
  const dto = info.event.extendedProps;
  const isCompleted = dto.status === "Completed";
  const isOverdue = dto.isOverdue;

  const isRoutine = dto.routineId != null || dto.isVirtual;

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

export function EventPopoverContent({
  eventData,
  hidePopover,
}: {
  eventData: any;
  hidePopover: () => void;
}) {
  const openDialog = useDialogStore.getState().openDialog;
  const { deleteTaskById } = useTask();
  const { deleteRoutine, toggleRoutineStatus, getRoutineById } = useRoutine();
  const { deleteEvent } = useTimelineEvent({});

  const { data: routine } = getRoutineById(eventData.routineId);

  // Nếu routine đã có task nào hoàn thành thì không cho phép xóa routine nữa, tránh trường hợp xóa nhầm mất cả đống task đã hoàn thành
  const routineCanBeDeleted =
    routine && routine.tasks?.some((task) => task.status == "Completed")
      ? false
      : true;

  const statusStyle = getStatusStyle(eventData.status);
  const isRoutine = eventData.routineId != null || eventData.isVirtual;
  const isTask = eventData.entityType === "Task";
  const isEvent = eventData.entityType === "TimelineEvent";

  const eventLabel = eventData.entityType === "Task" ? "Công việc" : "Sự kiện";

  const handleEdit = () => {
    if (isTask) {
      openDialog("TASK_FORM", {
        taskId: eventData.entityId,
        courseId: eventData.courseId,
      });
    } else if (isEvent) {
      openDialog("EVENT_FORM", {
        eventId: eventData.entityId,
        courseId: eventData.courseId,
      });
    }
  };

  const handleDelete = () => {
    openDialog("CONFIRM_DELETE", {
      itemType: isTask ? "công việc" : "sự kiện",
      itemName: eventData.title || `${eventLabel} chưa đặt tên`,
      onConfirm: () => {
        if (isTask) {
          deleteTaskById.mutate(
            {
              path: {
                taskId: Number(eventData.entityId),
              },
            },
            {
              onSuccess: () => {
                toast.success("Đã xóa công việc");
                hidePopover();
              },
            },
          );
        } else if (isEvent) {
          deleteEvent.mutate(
            {
              path: {
                timelineEventId: Number(eventData.entityId),
              },
            },
            {
              onSuccess: () => {
                toast.success("Đã xóa sự kiện");
                hidePopover();
              },
            },
          );
        }
      },
    });
  };

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
      <div className="flex flex-col mt-3 pt-2 border-t border-gray-200 -mx-2 gap-2 max-h-40 overflow-y-auto">
        <div className="flex flex-col pb-1">
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {`Thao tác ${eventLabel.toLowerCase()}`}
          </span>
          {isTask && (
            <Button
              variant={"ghost"}
              className="w-full justify-start px-2 py-2 h-auto font-normal"
              onClick={() => {
                openDialog("LOG_WORK_FORM", { taskId: eventData.entityId });
              }}
            >
              <Logs className="w-3 h-3 mr-2 text-gray-500" />
              Ghi nhận công việc
            </Button>
          )}

          <Button
            variant={"ghost"}
            className="w-full justify-start px-2 py-2 h-auto font-normal"
            onClick={() => {
              handleEdit();
            }}
          >
            <Pencil className="w-3 h-3 mr-2 text-blue-400" />
            {`Chỉnh sửa ${eventLabel.toLowerCase()}`}
          </Button>
          <Button
            className="w-full justify-start px-2 py-2 h-auto font-normal"
            variant={"ghost"}
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3 mr-2 text-red-400" />
            {`Xóa ${eventLabel.toLowerCase()}`}
          </Button>
        </div>

        {isRoutine && (
          <div className="flex flex-col border-t border-gray-200 pt-1 mt-1">
            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Thao tác với lịch trình cố định
            </span>
            <Button
              variant={"ghost"}
              className="w-full justify-start px-2 py-2 h-auto font-normal"
              onClick={() => {
                openDialog("ROUTINE_FORM", {
                  routineId: eventData.routineId,
                });
              }}
            >
              <Repeat className="w-3 h-3 mr-2 text-purple-500" />
              Chỉnh sửa lịch trình cố định
            </Button>
            {routineCanBeDeleted ? (
              <Button
                variant={"ghost"}
                className="w-full justify-start px-2 py-2 h-auto font-normal"
                onClick={() => {
                  openDialog("CONFIRM_DELETE", {
                    itemType: "lịch trình cố định",
                    itemName: eventData.title || "Lịch trình chưa đặt tên",
                    onConfirm: () => {
                      if (!eventData.routineId) return;
                      deleteRoutine.mutate({
                        path: {
                          id: Number(eventData.routineId),
                        },
                      });
                    },
                  });
                }}
              >
                <Trash2 className="w-3 h-3 mr-2 text-orange-600" />
                Xóa lịch trình cố định
              </Button>
            ) : (
              <Button
                variant={"ghost"}
                className="w-full justify-start px-2 py-2 h-auto font-normal"
                onClick={() => {
                  if (!eventData.routineId) return;
                  toggleRoutineStatus.mutate(
                    {
                      path: {
                        id: Number(eventData.routineId),
                      },
                    },
                    {
                      onSuccess: (updatedRoutine) => {
                        if (updatedRoutine.isActive) {
                          toast.success("Đã kích hoạt lại lịch trình");
                        } else {
                          toast.success("Đã dừng lịch trình");
                        }
                      },
                      onError: () => {
                        toast.error("Không thể thay đổi trạng thái lịch trình");
                      },
                    },
                  );
                }}
              >
                {routine?.isActive ? (
                  <>
                    <StopCircle className="w-3 h-3 mr-2 text-yellow-600" />
                    Dừng lịch trình
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3 h-3 mr-2 text-green-600" />
                    Kích hoạt lại lịch trình
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
