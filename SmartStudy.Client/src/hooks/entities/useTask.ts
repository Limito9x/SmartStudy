import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTaskByIdOptions,
  getTasksOptions,
  getTasksQueryKey,
  getTaskDetailByIdOptions,
  createTaskMutation,
  createTaskLogWorkMutation,
  updateTaskInfoMutation,
  updateTaskStatusMutation,
  deleteTaskByIdMutation,
  getTaskDetailByIdQueryKey,
  getTaskByIdQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskStatus } from "@/services/api";
import {
  invalidateCalendarContext,
} from "@/utils/query-invalidate";
import { invalidateCourseWorkloadContext } from "@/utils/query-invalidate";

export const useTask = () => {
  const queryClient = useQueryClient();

  const invalidateTaskRelatedQueries = (taskId: string | number) => {
    queryClient.invalidateQueries({
      queryKey: getTaskDetailByIdQueryKey({
        path: {
          taskId: taskId,
        },
      }),
    });
    queryClient.invalidateQueries({
      queryKey: getTaskByIdQueryKey({
        path: {
          taskId: taskId,
        },
      }),
    });
  };

  const getTasks = ({
    phaseId,
    status,
  }: {
    phaseId?: number;
    status?: TaskStatus;
  }) =>
    useQuery({
      ...getTasksOptions({
        query: {
          phaseId,
          status,
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
      enabled: !!id,
    });

  const getTaskDetailById = (id: number) =>
    useQuery({
      ...getTaskDetailByIdOptions({
        path: {
          taskId: id,
        },
      }),
      meta: {
        hasAssets: true,
      },
      enabled: !!id,
    });

  const createTask = useMutation({
    ...createTaskMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      invalidateCalendarContext(queryClient);
    },
  });

  const createTaskLogWork = useMutation({
    ...createTaskLogWorkMutation(),
    onSuccess: (data) => {
      const taskId = data.taskId;
      invalidateTaskRelatedQueries(taskId);
      invalidateCalendarContext(queryClient);
      invalidateCourseWorkloadContext(queryClient);
    },
  });

  const updateTaskInfo = useMutation({
    ...updateTaskInfoMutation(),
    onSuccess: (data) => {
      const taskId = data.id;
      invalidateTaskRelatedQueries(taskId);
      invalidateCalendarContext(queryClient);
    },
  });

  const updateTaskStatus = useMutation({
    ...updateTaskStatusMutation(),
    onSuccess: (data) => {
      const taskId = data.id;
      invalidateTaskRelatedQueries(taskId);
      invalidateCalendarContext(queryClient);
      invalidateCourseWorkloadContext(queryClient);
    },
  });

  const deleteTaskById = useMutation({
    ...deleteTaskByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      invalidateCalendarContext(queryClient);
    },
  });

  return {
    getTasks,
    getTaskById,
    getTaskDetailById,
    createTask,
    createTaskLogWork,
    updateTaskInfo,
    updateTaskStatus,
    deleteTaskById,
  };
};
