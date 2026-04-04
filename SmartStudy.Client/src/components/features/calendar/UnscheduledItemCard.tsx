import ActionMenu from "@/components/shared/ActionMenu";
import type { UnscheduledItemDto } from "@/services/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface UnscheduledItemCardProps {
  item: UnscheduledItemDto;
  onEdit: (item: UnscheduledItemDto) => void;
  onDelete: (item: UnscheduledItemDto) => void;
}

export default function UnscheduledItemCard({
  item,
  onEdit,
    onDelete,
}: UnscheduledItemCardProps) {
  return (
    <Card className="group w-full hover:bg-blue-100">
      <CardHeader className="flex flex-row items-start justify-between p-3 space-y-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 wrap-break-words line-clamp-2">
            {item.name}
          </h3>
        </div>
        <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 ml-2 shrink-0">
          <ActionMenu
            actions={[
              { label: "Chỉnh sửa", onClick: () => onEdit(item) },
              { label: "Xóa", onClick: () => onDelete(item) },
            ]}
          />
        </div>
      </CardHeader>
      {item.description && (
        <CardContent className="px-3 pb-3 pt-0">
          <p className="text-xs text-gray-500 line-clamp-2">
            {item.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}