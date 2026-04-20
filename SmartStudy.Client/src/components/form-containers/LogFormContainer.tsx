import { useTask } from "@/hooks/entities/useTask";
import { useLog } from "@/hooks/entities/useLog";
import { LogWorkForm } from "../forms/log/LogWorkForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { LogFormValues } from "@/components/forms/log/schema";
import { logApiMapper } from "@/utils/mapper/apiMapper";
import { logFormMapper } from "@/utils/mapper/formMapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTaskDetailByIdQueryKey,
  uploadAssetsMutation,
} from "@/services/api/@tanstack/react-query.gen";
import { formDataBodySerializer } from "@/services/api/client";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { toast } from "sonner";
import { invalidateAssetContext } from "@/utils/query-invalidate";

interface LogFormContainerProps {
  taskId?: number;
  logId?: number;
  defaultValues?: LogFormValues;
  onSuccess?: () => void;
}

export default function LogFormContainer({
  taskId: externalTaskId,
  logId: externalLogId,
  defaultValues: externalDefaultValues,
  onSuccess,
}: LogFormContainerProps = {}) {
  const { data, closeDialog } = useDialogStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const queryClient = useQueryClient();
  const dialogData = data as DialogDataMap["LOG_WORK_FORM"] | null;

  const taskId = externalTaskId ?? dialogData?.taskId;
  const logId = externalLogId ?? dialogData?.logId;
  const defaultValues = externalDefaultValues ?? dialogData?.defaultValues;

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }

    closeDialog();
  };

  if (!taskId) {
    return (
      <p className="text-sm text-muted-foreground">
        Không tìm thấy thông tin công việc để ghi nhận.
      </p>
    );
  }

  const isEditMode = !!logId;
  const { createTaskLogWork, getTaskById } = useTask();
  const { getLogById, updateLog } = useLog();

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: logData, isLoading } = getLogById(logId ?? 0);

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const uploadAssets = useMutation({
    ...uploadAssetsMutation({
      ...formDataBodySerializer,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  });

  const task = getTaskById(taskId).data; // Dùng để lấy thông tin task, nếu cần thiết cho form

  const invalidateTaskDetail = () => {
    queryClient.invalidateQueries({
      queryKey: getTaskDetailByIdQueryKey({
        path: {
          taskId,
        },
      }),
    });
  };

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues =
    isEditMode && logData
      ? logFormMapper.toFormValues(logData, task?.status || "Pending") // Map lại chuẩn form nếu cần
      : {
          ...defaultValues,
          note: defaultValues?.note || "",
          actualDuration:
            Math.floor(
              Math.abs(
                (new Date(task?.endDateTime || 0).getTime() -
                  new Date(task?.startDateTime || 0).getTime()) /
                  60000,
              ),
            ) || 60,
        };

  const handleSubmit = async (values: LogFormValues) => {
    const handleUploadFiles = (id: number) => {
      const logId = id;
      const filesToUpload = values.files?.filter(
        (file) => file instanceof File,
      );
      if (filesToUpload && filesToUpload.length > 0) {
        showLoading("Đang tải tệp lên...");
        uploadAssets.mutate(
          {
            body: {
              file: filesToUpload,
              linkedId: logId,
              linkedType: "Log",
            },
          },
          {
            onSuccess: (data) => {
              const totalUpload = data?.length ?? 0;
              invalidateTaskDetail();
              invalidateAssetContext(queryClient, "Log", logId);
              toast.success(`Tải lên ${totalUpload} tệp thành công`);
              handleSuccess();
            },
            onSettled: () => {
              hideLoading();
            },
          },
        );
      } else {
        invalidateTaskDetail();
        toast.success(
          isEditMode ? "Cập nhật log thành công" : "Tạo log thành công",
        );
        handleSuccess();
      }
    };

    if (isEditMode) {
      await updateLog(logId).mutateAsync({
        path: {
          taskLogId: logId!,
        },
        body: logApiMapper.toLogWorkDto(values),
      });

      invalidateTaskDetail();

      handleUploadFiles(logId);
    } else {
      const res = await createTaskLogWork.mutateAsync({
        body: logApiMapper.toLogWorkDto(values),
        path: {
          taskId,
        },
      });

      handleUploadFiles(Number(res.id));
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
