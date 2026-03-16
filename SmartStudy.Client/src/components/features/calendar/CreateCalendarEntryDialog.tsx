import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import RoutineForm from "@/components/forms/routine/RoutineForm";
import TaskForm from "@/components/forms/task/TaskForm";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { TaskFormValues } from "@/components/forms/task/schema";
import { Button } from "@/components/ui/button";
import { useRoutine } from "@/hooks/entities/useRoutine";
import { useTask } from "@/hooks/entities/useTask";
import { getCalendarQueryKey } from "@/services/api/@tanstack/react-query.gen";
import { useDialogStore } from "@/stores/useDialogStore";
import { routineApiMapper, taskApiMapper } from "@/utils/mapper.ts/apiMapper";

type CreateMode = "task" | "routine";

interface CreateCalendarEntryDialogProps {
  studyPlanId?: number;
  selectedStart: Date;
  selectedEnd: Date;
}

const toTimeValue = (value: Date): string => {
  const h = value.getHours().toString().padStart(2, "0");
  const m = value.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default function CreateCalendarEntryDialog({
  studyPlanId,
  selectedStart,
  selectedEnd,
}: CreateCalendarEntryDialogProps) {
  const [mode, setMode] = useState<CreateMode>("task");
  const queryClient = useQueryClient();
  const { closeDialog } = useDialogStore();
  const { createTask } = useTask();
  const { createRoutine } = useRoutine();

  const taskDefaultValues = useMemo<TaskFormValues>(
    () => ({
      name: "",
      description: "",
      dueDate: selectedStart.toISOString(),
      startAt: toTimeValue(selectedStart),
      endAt: toTimeValue(selectedEnd),
      type: "SelfStudy",
      linkedFormIds: null,
      courseId: null,
    }),
    [selectedEnd, selectedStart],
  );

  const routineDefaultValues = useMemo<RoutineFormValues>(
    () => ({
      name: "",
      description: "",
      instructor: "",
      type: "SelfStudy",
      courseId: undefined,
      startDate: selectedStart.toISOString(),
      endDate: undefined,
    }),
    [selectedStart],
  );

  if (!studyPlanId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Chưa xác định được kế hoạch học tập đang dùng. Vui lòng tạo hoặc kích
          hoạt một kế hoạch trước khi thêm nhiệm vụ.
        </p>
        <Button type="button" onClick={closeDialog}>
          Đóng
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "task" ? "default" : "outline"}
          onClick={() => setMode("task")}
          className="flex-1"
        >
          Nhiệm vụ 1 lần
        </Button>
        <Button
          type="button"
          variant={mode === "routine" ? "default" : "outline"}
          onClick={() => setMode("routine")}
          className="flex-1"
        >
          Lịch lặp lại
        </Button>
      </div>

      {mode === "task" ? (
        <TaskForm
          studyPlanId={studyPlanId}
          defaultValues={taskDefaultValues}
          onSubmit={(values) => {
            createTask.mutate(
              {
                body: taskApiMapper.toRequestTaskDto(values, studyPlanId),
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: getCalendarQueryKey(),
                  });
                  toast.success("Tạo nhiệm vụ thành công");
                  closeDialog();
                },
                onError: () => {
                  toast.error("Không thể tạo nhiệm vụ");
                },
              },
            );
          }}
        />
      ) : (
        <RoutineForm
          studyPlanId={studyPlanId}
          defaultValues={routineDefaultValues}
          onSubmit={(values) => {
            createRoutine.mutate(
              {
                body: routineApiMapper.toRequestRoutineDto(values, studyPlanId),
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: getCalendarQueryKey(),
                  });
                  toast.success("Tạo lịch lặp lại thành công");
                  closeDialog();
                },
                onError: () => {
                  toast.error("Không thể tạo lịch lặp lại");
                },
              },
            );
          }}
        />
      )}
    </div>
  );
}
