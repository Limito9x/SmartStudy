import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLogOptions,
  getLogQueryKey,
  updateLogMutation,
  deleteLogMutation,
  getCalendarQueryKey,
  getStudentDashboardSummaryQueryKey,
} from "@/services/api/@tanstack/react-query.gen";

export const useLog = () => {
  const queryClient = useQueryClient();

  const getLogById = (id: number) =>
    useQuery({
      ...getLogOptions({
        path: {
          taskLogId: id,
        },
      }),
      enabled: !!id,
    });

  const updateLog = (id: number) =>
    useMutation({
      ...updateLogMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getLogQueryKey({
            path: {
              taskLogId: id!,
            },
          }),
        });
        queryClient.invalidateQueries({
          queryKey: getCalendarQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getStudentDashboardSummaryQueryKey(),
        });
        alert("Cập nhật log thành công");
      },
    });

  const deleteLog = (id: number) =>
    useMutation({
      ...deleteLogMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getLogQueryKey({
            path: {
              taskLogId: id!,
            },
          }),
        });
        queryClient.invalidateQueries({
          queryKey: getCalendarQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getStudentDashboardSummaryQueryKey(),
        });
        alert("Xóa log thành công");
      },
    });

  return {
    getLogById,
    updateLog,
    deleteLog,
  };
};
