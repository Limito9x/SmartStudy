import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTaskByIdOptions,
  getTasksOptions,
  getTasksQueryKey,
  createTaskMutation,
  createTaskLogWorkMutation,
  updateTaskInfoMutation,
  updateTaskStatusMutation,
  deleteTaskByIdMutation,
} from "@/services/api/@tanstack/react-query.gen";

export const useTask = () => {
  const queryClient = useQueryClient();

  const getTasks = ({ from, to }: { from: string; to: string }) =>
    useQuery({
      ...getTasksOptions({
        query: {
          fromDate: from,
          toDate: to,
        },
      }),
    });

  const getTaskById = (id: number) =>
    useQuery({
      ...getTaskByIdOptions({
        path: {
          taskId: id,
        },
      }),
    });

  const createTask = useMutation({
    ...createTaskMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      alert("Tạo công việc thành công");
    },
  });

  const createTaskLogWork = useMutation({
    ...createTaskLogWorkMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      alert("Thêm log công việc thành công");
    },
  });

  const updateTaskInfo = (id: number) => useMutation({
    ...updateTaskInfoMutation({
        path: {
            taskId: id,
        }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      alert("Cập nhật công việc thành công");
    },
  });

  const updateTaskStatus = (id: number) => useMutation({
    ...updateTaskStatusMutation({
        path: {
            taskId: id,
        }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      alert("Cập nhật trạng thái công việc thành công");
    },
  });

  const deleteTaskById = (id: number) => useMutation({
    ...deleteTaskByIdMutation({
      path: {
        taskId: id,
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      alert("Xóa công việc thành công");
    },
  });

  return {
    getTasks,
    getTaskById,
    createTask,
    createTaskLogWork,
    updateTaskInfo,
    updateTaskStatus,
    deleteTaskById,
  };
};
