import {
  ClipboardList,
  Flag,
  GraduationCap,
  Handshake,
  Notebook,
} from "lucide-react";
import type { TaskType, TaskStatus } from "@/services/api";

export type TaskDisplayStatus = TaskStatus | "Overdue";

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
    case "Milestone":
      return <Flag size={16} className="text-rose-500" />;
    default:
      return <Notebook size={16} />;
  }
}

export function getTaskTypeLabel(type?: TaskType | string | null): string {
  switch (type) {
    case "ClassSession":
      return "Học trên lớp";
    case "SelfStudy":
      return "Tự học";
    case "AssignmentWork":
      return "Bài tập";
    case "Meeting":
      return "Họp nhóm";
    case "Milestone":
      return "Deadline Phase";
    default:
      return type ? String(type) : "—";
  }
}

export function resolveTaskDisplayStatus(task: {
  status: TaskStatus;
  isOverdue?: boolean | null;
}): TaskDisplayStatus {
  if (task.isOverdue) {
    return "Overdue";
  }

  return task.status;
}

export function getStatusStyle(status: TaskDisplayStatus) {
  switch (status) {
    case "Overdue":
      return {
        label: "Quá hạn",
        badgeClass: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100",
      };
    case "Pending":
      return {
        label: "Đang chờ",
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
    case "Archived":
      return {
        label: "Lưu trữ",
        badgeClass:
          "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-100",
      };
    default:
      return {
        label: String(status),
        badgeClass: "bg-muted text-muted-foreground border-border",
      };
  }
}
