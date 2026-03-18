import type { UnscheduledItemDto, CalendarEntityType } from "@/services/api";
import { Trash2 } from "lucide-react";

interface UnscheduledListProps {
  items: UnscheduledItemDto[] | undefined;
  onDragStart: (item: UnscheduledItemDto) => void;
  onDragEnd: () => void;
  onDelete: (item: UnscheduledItemDto) => void; // 1. Bổ sung prop gọi API xóa
}

const entityTypeToLabel: Record<CalendarEntityType, string> = {
  Task: "Công việc",
  Routine: "Thói quen",
  TimelineEvent: "Sự kiện",
  Schedule: "Khung giờ học",
};

export default function UnscheduledList({
  items,
  onDragStart,
  onDragEnd,
  onDelete,
}: UnscheduledListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-4 text-center">
        Không có mục nào chưa được lên lịch
      </div>
    );
  }

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: UnscheduledItemDto,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    onDragStart(item);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="relative flex">
          <div
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={onDragEnd}
            // 2. Thêm class 'group' để bắt sự kiện hover cho cái thùng rác bên trong
            className="group flex-1 flex flex-col p-3 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300"
          >
            {/* 3. Đổi items-start thành items-center để chữ và nút xóa cùng nằm trên 1 đường ngang */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {item.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {entityTypeToLabel[item.entityType!]}
                </div>
              </div>

              {/* 4. Thùng rác được bọc trong button, có hiệu ứng hover ẩn/hiện mượt mà */}
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Xóa mục này"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
