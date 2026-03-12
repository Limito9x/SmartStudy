import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoutinesQueryKey,
  createScheduleMutation,
  deleteScheduleMutation,
  getCalendarQueryKey
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

  const deleteSchedule =
    useMutation({
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

  return {
    createSchedule,
    deleteSchedule,
  };
};
