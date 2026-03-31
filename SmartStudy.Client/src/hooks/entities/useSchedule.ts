import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoutinesQueryKey,
  getTasksQueryKey,
  getInboxItemsQueryKey,
  getStudentDashboardSummaryQueryKey,
  createScheduleMutation,
  deleteScheduleMutation,
  updateScheduleMutation,
  confirmTaskOnOccurrenceMutation,
  getCalendarQueryKey,
} from "@/services/api/@tanstack/react-query.gen";

export const useSchedule = () => {
  const queryClient = useQueryClient();

  const createSchedule = useMutation({
    ...createScheduleMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      alert("Tạo lịch học thành công");
    },
  });

  const deleteSchedule = useMutation({
    ...deleteScheduleMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      alert("Xóa lịch học thành công");
    },
  });

  const updateSchedule = useMutation({
    ...updateScheduleMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      alert("Cập nhật lịch học thành công");
    },
  });

  const confirmTaskOnOccurrence = useMutation({
    ...confirmTaskOnOccurrenceMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getInboxItemsQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getStudentDashboardSummaryQueryKey(),
      });
    },
  });

  return {
    createSchedule,
    deleteSchedule,
    updateSchedule,
    confirmTaskOnOccurrence,
  };
};
