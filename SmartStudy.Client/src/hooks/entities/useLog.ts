import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLogByIdOptions,
  getLogByIdQueryKey,
  updateLogMutation,
  deleteLogMutation,
  getCalendarQueryKey,
  getStudentDashboardSummaryQueryKey,
} from "@/services/api/@tanstack/react-query.gen";

export const useLog = () => {
  const queryClient = useQueryClient();

  const getLogById = (id: number) =>
    useQuery({
      ...getLogByIdOptions({
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
          queryKey: getLogByIdQueryKey({
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
      },
    });

  const deleteLog = (id: number) =>
    useMutation({
      ...deleteLogMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getLogByIdQueryKey({
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
      },
    });

  return {
    getLogById,
    updateLog,
    deleteLog,
  };
};
