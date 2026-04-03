import { ClipboardList, GraduationCap, Handshake, Notebook } from "lucide-react";
import type { TaskType, TaskStatus } from "@/services/api";

export function renderTaskIcon(type: TaskType) {
  switch (type) {
    case "ClassSession":
      return <GraduationCap size={16} />;
    case "SelfStudy":
      return <Notebook size={16} />;
    case "AssignmentWork":
      return <ClipboardList size={16} />;
    case "Meeting":
      return <Handshake size={16} />;
    default:
      return <Notebook size={16} />;
  }
}

export function getStatusStyle(status: TaskStatus) {
  switch (status) {
    case "Pending":
      return {
        label: "Chờ xử lý",
        badgeClass:
          "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100",
      };
    case "InProgress":
      return {
        label: "Đang thực hiện",
        badgeClass:
          "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
      };
    case "Completed":
      return {
        label: "Hoàn thành",
        badgeClass:
          "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
      };
    case "Cancelled":
      return {
        label: "Đã hủy",
        badgeClass:
          "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-100",
      };
    default:
      return {
        label: String(status),
        badgeClass: "bg-muted text-muted-foreground border-border",
      };
  }
}