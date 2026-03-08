import { type ColumnDef } from "@tanstack/react-table";
import type { ResponseSubjectDto, SubjectType } from "@/services/api";
import ActionMenu from "../ActionMenu";
import { Badge } from "@/components/ui/badge";

const typeTextMapping: Record<SubjectType, string> = {
  Theory: "Lý thuyết",
  Practice: "Thực hành",
  Project: "Đồ án",
  Thesis: "Luận văn",
};

const typeColorMapping: Record<
  SubjectType,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Theory: "outline", // Màu đen/đậm
  Practice: "secondary", // Màu
  Project: "default", // Màu đen
  Thesis: "destructive", // Màu đỏ
};

export const subjectColumns: ColumnDef<ResponseSubjectDto>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left font-semibold">Tên môn học</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "credits",
    header: () => <div className="text-center font-semibold">Số tín chỉ</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("credits")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center font-semibold">Loại môn học</div>,
    cell: ({ getValue }) => {
      const type = getValue<SubjectType>();
      return (
        <div className="text-center">
          {/* Badge sẽ giúp cái chữ có background bo góc cực đẹp */}
          <Badge variant={typeColorMapping[type]}>
            {typeTextMapping[type]}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center font-semibold">Hành động</div>,
    cell: ({ row, table }) => {
      const subject = row.original;
      const meta = table.options.meta;

      const actions = [
        {
          label: "Sửa",
          onClick: () => meta?.onEdit?.(subject),
        },
        {
          label: "Xóa",
          onClick: () => meta?.onDelete?.(subject),
        },
      ];
      return <ActionMenu actions={actions} />;
    },
  },
];
