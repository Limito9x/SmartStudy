import { useTask } from "@/hooks/entities/useTask";
import { useLog } from "@/hooks/entities/useLog";
import { LogWorkForm } from "../log/LogWorkForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { LogFormValues } from "../log/schema";
import { logApiMapper } from "@/utils/mapper.ts/apiMapper";
import { logFormMapper } from "@/utils/mapper.ts/formMapper";

export default function LogFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { logId, taskId, defaultValues } =
    data as DialogDataMap["LOG_WORK_FORM"];

  const isEditMode = !!logId;
  const { createTaskLogWork, getTaskById } = useTask();
  const { getLogById, updateLog } = useLog();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: logData, isLoading } = getLogById(logId!);

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const task = getTaskById(taskId).data; // Dùng để lấy thông tin task, nếu cần thiết cho form

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues =
    isEditMode && logData
      ? logFormMapper.toFormValues(logData, task?.status || "Pending") // Map lại chuẩn form nếu cần
      : {
          ...defaultValues,
          note: defaultValues?.note || "",
          actualDuration: Number(task?.plannedDuration) || 60,
        };

  const handleSubmit = (values: LogFormValues) => {
    if (isEditMode) {
      updateLog(logId).mutate(
        {
          path: {
            taskLogId: logId!,
          },
          body: logApiMapper.toLogWorkDto(values),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createTaskLogWork.mutate(
        {
          body: logApiMapper.toLogWorkDto(values),
          path: {
            taskId,
          },
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <LogWorkForm
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
      taskStatus={task?.status || "Pending"}
      taskType={task?.type}
    />
  );
}
