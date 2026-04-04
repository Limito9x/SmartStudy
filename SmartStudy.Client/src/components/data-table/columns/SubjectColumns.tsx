import { type ColumnDef } from "@tanstack/react-table";
import type { ResponseSubjectDto } from "@/services/api";
import ActionMenu from "../../shared/ActionMenu";

export const academicSubjectColumns: ColumnDef<ResponseSubjectDto>[] = [
  {
    accessorKey: "code",
    header: () => <div className="text-left font-semibold">Mã môn học</div>,
    cell: ({ row }) => {
      const code = row.getValue("code") as string | null | undefined;
      return <div className="text-left">{code || "-"}</div>;
    },
  },
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

export const personalSubjectColumns: ColumnDef<ResponseSubjectDto>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left font-semibold">Tên môn học</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("name")}</div>,
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
