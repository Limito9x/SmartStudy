import { useTask } from "@/hooks/entities/useTask"; // File useTask.ts của bác
import TaskForm from "../task/TaskForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { TaskFormValues } from "../task/schema";
import { taskApiMapper } from "@/utils/mapper.ts/apiMapper";
import { taskFormMapper } from "@/utils/mapper.ts/formMapper";

export default function TaskFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { studyPlanId, taskId, defaultValues } =
    data as DialogDataMap["TASK_FORM"];

  const isEditMode = !!taskId;
  const { getTaskById, createTask, updateTaskInfo } = useTask();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: taskData, isLoading } = getTaskById(taskId!);

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues =
    isEditMode && taskData
      ? taskFormMapper.toFormValues(taskData) // Map lại chuẩn form nếu cần
      : {
        ...defaultValues,
        name: defaultValues?.name || "",
        type: defaultValues?.type || "SelfStudy",
      };

      

  const handleSubmit = (values: TaskFormValues) => {
    if (isEditMode) {
      updateTaskInfo.mutate(
        {
          path: { taskId: taskId! },
          body: taskApiMapper.toRequestTaskDto(values, studyPlanId),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createTask.mutate(
        {
          body: taskApiMapper.toRequestTaskDto(values, studyPlanId),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <TaskForm
      studyPlanId={studyPlanId}
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
