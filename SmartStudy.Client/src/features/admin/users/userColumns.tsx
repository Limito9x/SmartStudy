import type { ColumnDef } from "@tanstack/react-table";
import type { UserAdminDto } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import ActionMenu from "@/components/data-table/ActionMenu";
import { useAdminDialogStore } from "@/stores/useAdminDialogStore";

export const userColumns: ColumnDef<UserAdminDto>[] = [
  {
    accessorKey: "fullName",
    header: "Tên",
    cell: ({ row }) => <span>{row.getValue("fullName")}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm">{row.getValue("email")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tham gia",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <span className="text-sm">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      );
    },
  },
  {
    accessorKey: "totalStudyHours",
    header: "Giờ học",
    cell: ({ row }) => {
      const hours = Number(row.getValue("totalStudyHours")) || 0;
      return <span className="font-medium">{hours.toFixed(1)} giờ</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Hoạt động" : "Khóa"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      const user = row.original;
      const { openDialog } = useAdminDialogStore();

      const handleToggleClick = () => {
        openDialog("CONFIRM_TOGGLE_STATUS", user);
      };

      const actions = [
        {
          label: user.isActive ? "Khóa người dùng" : "Mở khóa người dùng",
          onClick: handleToggleClick,
        },
      ];

      return <ActionMenu actions={actions} />;
    },
  },
];
