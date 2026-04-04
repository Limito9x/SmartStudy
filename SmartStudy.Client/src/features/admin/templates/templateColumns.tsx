import type { ColumnDef } from "@tanstack/react-table";
import type { PlanTemplateDto } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import ActionMenu from "@/components/shared/ActionMenu";

interface TemplateColumnActions {
  onView: (template: PlanTemplateDto) => void;
  onEdit: (template: PlanTemplateDto) => void;
  onDelete: (template: PlanTemplateDto) => void;
  onTogglePublish: (template: PlanTemplateDto) => void;
}

export const createTemplateColumns = (
  actions: TemplateColumnActions,
): ColumnDef<PlanTemplateDto>[] => [
  {
    accessorKey: "name",
    header: "Tên template",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "courseCount",
    header: "Môn",
    cell: ({ row }) => <span>{Number(row.getValue("courseCount") || 0)}</span>,
  },
  {
    accessorKey: "routineCount",
    header: "Routine",
    cell: ({ row }) => <span>{Number(row.getValue("routineCount") || 0)}</span>,
  },
  {
    accessorKey: "durationDays",
    header: "Thời lượng",
    cell: ({ row }) => (
      <span>{Number(row.getValue("durationDays") || 0)} ngày</span>
    ),
  },
  {
    accessorKey: "isPublic",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isPublic = !!row.getValue("isPublic");
      return (
        <Badge variant={isPublic ? "default" : "secondary"}>
          {isPublic ? "Public" : "Private"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdByName",
    header: "Người tạo",
    cell: ({ row }) => (
      <span>{String(row.getValue("createdByName") || "N/A")}</span>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      const template = row.original;

      return (
        <ActionMenu
          actions={[
            {
              label: "Xem chi tiết",
              onClick: () => actions.onView(template),
            },
            {
              label: "Chỉnh sửa",
              onClick: () => actions.onEdit(template),
            },
            {
              label: template.isPublic ? "Ẩn template" : "Công khai template",
              onClick: () => actions.onTogglePublish(template),
            },
            {
              label: "Xóa",
              onClick: () => actions.onDelete(template),
            },
          ]}
        />
      );
    },
  },
];
