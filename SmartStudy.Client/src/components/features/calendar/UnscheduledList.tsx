import type { UnscheduledItemDto } from "@/services/api";

interface UnscheduledListProps {
  items: UnscheduledItemDto[] | undefined;
  onDragStart: (item: UnscheduledItemDto) => void;
  onDragEnd: () => void;
}

export default function UnscheduledList({ items, onDragStart, onDragEnd }: UnscheduledListProps) {
  if (!items || items.length === 0) {
    return <div>Không có mục nào chưa được lên lịch</div>;
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
          <div
            key={item.id}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={onDragEnd} // Thả chuột ra là gọi hàm này báo cho Cha biết
            // cursor-grab: Chuột hình bàn tay mở
            // active:cursor-grabbing: Bấm vào thì bàn tay nắm lại
            // hover:shadow-md: Trỏ chuột vào nổi bóng lên
            className="flex flex-col p-3 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300"
          >
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.entityType}</div>
                </div>
            </div>
          </div>
        ))}
      </div>
    );
}