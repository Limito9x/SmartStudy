import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { CourseTaskDto, TaskStatus, TaskType } from "@/services/api";
import {
  CalendarClock,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Handshake,
  Notebook,
} from "lucide-react";
import TaskInput from "./TaskInput";
import TaskOutput from "./TaskOutput";

interface CourseTaskCardProps {
  taskData: CourseTaskDto;
}

export default function CourseTaskCard({ taskData }: CourseTaskCardProps) {
  const task = taskData.task;

  if (!task) {
    return null;
  }

  const taskId = normalizeId(task.id);
  const TaskIcon = getTaskIcon(task.type);
  const statusStyle = getStatusStyle(task.status);

  return (
    <Collapsible className="rounded-xl border bg-card">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent/40"
        >
          <div className="min-w-0 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TaskIcon size={16} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{task.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock size={12} />
                <span>
                  {task.taskDate
                    ? new Date(task.taskDate).toLocaleDateString("vi-VN")
                    : "Chưa có hạn"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn("border", statusStyle.badgeClass)}>
              {statusStyle.label}
            </Badge>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t px-4 py-4">
        <div className="space-y-4">
          <section className="space-y-3">
            <TaskInput taskId={taskId} docs={taskData.docs ?? []} />
          </section>

          <hr className="my-4 border-border/70" />

          <section className="space-y-3">
            <TaskOutput taskId={taskId} logs={taskData.logs ?? []} />
          </section>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function normalizeId(rawId: number | string) {
  const id = Number(rawId);
  return Number.isFinite(id) ? id : 0;
}

function getTaskIcon(type: TaskType) {
  switch (type) {
    case "ClassSession":
      return GraduationCap;
    case "SelfStudy":
      return Notebook;
    case "AssignmentWork":
      return ClipboardList;
    case "Meeting":
      return Handshake;
    default:
      return Notebook;
  }
}

function getStatusStyle(status: TaskStatus) {
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
