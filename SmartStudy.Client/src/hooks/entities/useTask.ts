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
      enabled: !!from && !!to,
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
    },
  });

  const createTaskLogWork = useMutation({
    ...createTaskLogWorkMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
    },
  });

  const updateTaskInfo = useMutation({
    ...updateTaskInfoMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
    },
  });

  const updateTaskStatus = useMutation({
    ...updateTaskStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
    },
  });

  const deleteTaskById = useMutation({
    ...deleteTaskByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
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
