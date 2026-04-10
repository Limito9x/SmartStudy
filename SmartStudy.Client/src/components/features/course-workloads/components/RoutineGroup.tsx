import type { CourseRoutineDto } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Folder } from "lucide-react";
import CourseTaskCard from "./CourseTaskCard";
import ActionMenu from "@/components/shared/ActionMenu";
import { useRoutine } from "@/hooks/entities/useRoutine";
import { useDialogStore } from "@/stores/useDialogStore";
import { toast } from "sonner";
import { invalidateCourseContext } from "@/utils/query-invalidate";
import { useQueryClient } from "@tanstack/react-query";

interface RoutineGroupProps {
  routine: CourseRoutineDto;
  value: string;
}

export default function RoutineGroup({ routine, value }: RoutineGroupProps) {
  const routineName = routine.routine?.name || "Routine chưa đặt tên";
  const tasks = routine.tasks ?? [];
  const { deleteRoutine, toggleRoutineStatus } = useRoutine();
  const { openDialog } = useDialogStore();
  const isRoutineActive = Boolean(routine.routine?.isActive);
  const queryClient = useQueryClient();

  const handleEdit = () => {
    if (routine.routine?.id) {
      openDialog("ROUTINE_FORM", { routineId: Number(routine.routine.id) });
    }
  };

  const handleDelete = () => {
    if (routine.routine?.id) {
      openDialog("CONFIRM_DELETE", {
        itemType: "routine",
        itemName: routine.routine.name || "Routine chưa đặt tên",
        onConfirm: () => {
          deleteRoutine.mutate(
            { path: { id: Number(routine.routine?.id) } },
            {
              onSuccess: () => {
                invalidateCourseContext(
                  queryClient,
                  Number(routine.routine?.courseId),
                );
                toast.success("Đã xóa routine");
              },
            },
          );
        },
      });
    }
  };

  const handleToggleStatus = () => {
    const routineId = Number(routine.routine?.id ?? 0);
    if (!routineId) {
      return;
    }

    toggleRoutineStatus.mutate(
      {
        path: { id: routineId },
      },
      {
        onSuccess: (data) => {
          toast.success(data.isActive ? "Đã bật routine" : "Đã tắt routine");
        },
        onError: () => {
          toast.error("Không thể cập nhật trạng thái routine");
        },
      },
    );
  };

  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-xl border bg-card px-0"
    >
      <div className="flex items-center pe-3 hover:bg-slate-50/70 [&>*:first-child]:flex-1">
        <AccordionTrigger className="gap-2 px-3 py-2.5 hover:bg-transparent hover:no-underline data-[state=open]:bg-transparent">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Folder className="size-4 shrink-0 text-muted-foreground" />
              <h3 className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-foreground/90">
                {routineName}
              </h3>
            </div>
            <Badge
              variant="outline"
              className="h-6 shrink-0 rounded-full px-2 text-xs font-medium text-muted-foreground"
            >
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </Badge>
            <Badge
              variant={isRoutineActive ? "default" : "secondary"}
              className="h-6 shrink-0 rounded-full px-2 text-xs"
            >
              {isRoutineActive ? "Đang bật" : "Đã tắt"}
            </Badge>
          </div>
        </AccordionTrigger>
        {routine.routine?.id && (
          <div className="flex items-center">
            <ActionMenu
              actions={[
                {
                  label: isRoutineActive ? "Tắt routine" : "Bật routine",
                  onClick: handleToggleStatus,
                },
                { label: "Chỉnh sửa", onClick: handleEdit },
                { label: "Xóa", onClick: handleDelete },
              ]}
            />
          </div>
        )}
      </div>

      <AccordionContent className="px-3 pt-2">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            Chưa có công việc trong routine này.
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <CourseTaskCard
                key={String(task?.id ?? `routine-task-${index}`)}
                taskData={task}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
