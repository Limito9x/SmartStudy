import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
      alert("Tạo lịch học thành công");
    },
  });

  const deleteSchedule = (id: number) =>
    useMutation({
      ...deleteScheduleMutation({
        path: {
          id,
        },
      }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getCalendarQueryKey(),
        });
        alert("Xóa lịch học thành công");
      },
    });

  return {
    createSchedule,
    deleteSchedule,
  };
};
